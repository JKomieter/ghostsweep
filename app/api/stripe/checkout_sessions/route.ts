import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server';
import stripe from '@/lib/stripe';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const checkoutRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '60 s'),
    analytics: true,
    prefix: 'ratelimit:checkout',
});

export async function POST(req: NextRequest) {
    try {
        const headersList = await headers()
        const origin = headersList.get('origin')

        const supabase = await createClient();

        // Check authentication
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: "Unauthorized. Please log in." },
                { status: 401 }
            );
        }

        // Rate limiting for premium checkout
        const ip = headersList.get("x-forwarded-for") || "127.0.0.1";
        const { success, reset } = await checkoutRateLimit.limit(user.id || ip);
        
        if (!success) {
            const retryAfter = Math.ceil((reset - Date.now()) / 1000);
            return NextResponse.json(
                { 
                    error: "High Demand",
                    message: "GhostSweep is currently experiencing high demand for our premium features. To ensure the highest level of service for all members, please take a brief pause and try again in a few moments.",
                    retryAfter
                },
                { 
                    status: 429,
                    headers: {
                        'Retry-After': retryAfter.toString(),
                    }
                }
            );
        }

        // Get price_id and mode from request (mode: "subscription" | "payment")
        const contentType = req.headers.get("content-type") || "";
        let price_id: string | undefined;
        let referral_code: string | undefined;
        let price_mode: "subscription" | "payment" = "subscription";

        if (contentType.includes("application/json")) {
            const body = await req.json();
            price_id = body.price_id;
            referral_code = body.referral_code;
            if (body.mode === "payment") price_mode = "payment";
        } else {
            const formData = await req.formData();
            price_id = formData.get("price_id") as string | undefined;
            referral_code = formData.get("referral_code") as string | undefined;
            if (formData.get("mode") === "payment") price_mode = "payment";
        }

        if (!price_id) {
            return NextResponse.json(
                { error: "Missing price_id" },
                { status: 400 }
            );
        }

        // Whitelist allowed price IDs to prevent probing arbitrary Stripe prices
        const ALLOWED_PRICE_IDS = [
            process.env.STRIPE_PRICE_BUSTER,
            process.env.STRIPE_PRICE_PRO,
            process.env.STRIPE_PRICE_SENTINEL,
        ].filter(Boolean);
        if (!ALLOWED_PRICE_IDS.includes(price_id)) {
            return NextResponse.json(
                { error: "Invalid pricing plan." },
                { status: 400 }
            );
        }

        // Check existing subscription
        const { data: subRow } = await supabase
            .from("user_subscriptions")
            .select("stripe_customer_id, current_plan, trial_started_at")
            .eq("user_id", user.id)
            .maybeSingle();

        // If already pro or sentinel, don't allow checkout
        if (subRow?.current_plan === 'pro' || subRow?.current_plan === 'sentinel') {
            return NextResponse.json(
                { error: "You already have an active subscription." },
                { status: 400 }
            );
        }

        // Buster users can upgrade to pro/sentinel — only block re-buying buster
        if (subRow?.current_plan === 'buster' && price_mode === 'payment') {
            return NextResponse.json(
                { error: "You already own The Buster. Upgrade to Pro for unlimited access." },
                { status: 400 }
            );
        }

        const hasUsedTrial = Boolean(subRow?.trial_started_at);

        let stripeCustomerId = subRow?.stripe_customer_id as string | null;

        // Verify the stored customer exists in the current Stripe mode
        // (live-mode IDs fail with test keys and vice versa)
        if (stripeCustomerId) {
            try {
                const existing = await stripe.customers.retrieve(stripeCustomerId);
                if ((existing as { deleted?: boolean }).deleted) {
                    stripeCustomerId = null;
                }
            } catch (err: unknown) {
                if ((err as { code?: string })?.code === 'resource_missing') {
                    console.warn(`Stripe customer ${stripeCustomerId} not found in current mode — creating new.`);
                    stripeCustomerId = null;
                } else {
                    throw err;
                }
            }
        }

        // Create Stripe customer if needed
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: { supabase_user_id: user.id },
            });
            stripeCustomerId = customer.id;

            const { error: funcError } = await supabase.functions.invoke("update-user-stripeId", {
                body: { userId: user.id, stripeCustomerId },
                headers: { "x-ghostsweep-secret": process.env.FUNCTION_SECRET! }
            });
            if (funcError) console.error("Failed to store Stripe customer ID:", funcError);
        }

        // get thr user_subscription row for the referrer if referral_code is provided
        let referrerStripeCustomerId: string | null = null;
        let referrerSupabaseId: string | null = null;
        if (referral_code) {
            const { data: referrerSub } = await supabase
                .from("user_subscriptions")
                .select("id, stripe_customer_id, user_id")
                .eq("referral_code", referral_code)
                .maybeSingle();

            if (!referrerSub) {
                console.warn("Invalid referral code provided:", referral_code);
            } else {
                referrerStripeCustomerId = referrerSub.stripe_customer_id;
                referrerSupabaseId = referrerSub.user_id;
            }
        }

        const shouldApplyReferralDiscount = Boolean(referrerStripeCustomerId);
        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            line_items: [{ price: price_id, quantity: 1 }],
            mode: price_mode,
            success_url: `${origin}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/dashboard/billing?canceled=true`,
            automatic_tax: { enabled: true },
            // Always allow Stripe to save the billing address the customer enters,
            // which is required for automatic tax when no address is on the customer yet
            customer_update: { address: 'auto' },
            billing_address_collection: 'auto',
            allow_promotion_codes: true,
            ...(price_mode === 'subscription' ? {
                subscription_data: {        
                    ...(hasUsedTrial ? {} : { trial_period_days: 3 }),
                },
            } : {}),
            ...(shouldApplyReferralDiscount
                ? { discounts: [{ promotion_code: 'SWEEP50' }] }
                : {}),
            metadata: {
                supabase_user_id: user.id,
                price_id,
                ...(referral_code ? { referral_code } : {}),
                ...(referrerStripeCustomerId ? { referrer_stripe_customer_id: referrerStripeCustomerId } : {}),
                ...(referrerSupabaseId ? { referrer_supabase_id: referrerSupabaseId } : {}),
            },
        });

        if (!session.url) {
            throw new Error("Failed to create checkout session URL");
        }

        // Return URL for client-side redirect
        return NextResponse.json({
            url: session.url,
            sessionId: session.id,
        });

    } catch (err) {
        console.error("Stripe checkout error:", err);

        // Handle specific Stripe errors
        if (err instanceof Error && err.message.includes('No such price')) {
            return NextResponse.json(
                { error: "Invalid pricing plan. Please contact support." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create checkout session. Please try again." },
            { status: 500 }
        );
    }
}