import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server';
import stripe from '@/lib/stripe';
import { resolvePlan } from '@/lib/entitlements';
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

        // Plans map to Stripe prices server-side; the checkout mode is derived from the plan
        // rather than trusted from the client (a recurring price can't be bought in payment mode).
        const PLAN_PRICES: Record<string, { price: string | undefined; mode: "subscription" | "payment" }> = {
            buster: { price: process.env.STRIPE_PRICE_BUSTER, mode: "payment" },
            pro: { price: process.env.STRIPE_PRICE_PRO, mode: "subscription" },
            sentinel: { price: process.env.STRIPE_PRICE_SENTINEL, mode: "subscription" },
        };

        // Accept either { plan } or a legacy { price_id }
        const contentType = req.headers.get("content-type") || "";
        let plan: string | undefined;
        let requested_price_id: string | undefined;
        let referral_code: string | undefined;

        if (contentType.includes("application/json")) {
            const body = await req.json();
            plan = body.plan;
            requested_price_id = body.price_id;
            referral_code = body.referral_code;
        } else {
            const formData = await req.formData();
            plan = (formData.get("plan") as string | null) ?? undefined;
            requested_price_id = (formData.get("price_id") as string | null) ?? undefined;
            referral_code = (formData.get("referral_code") as string | null) ?? undefined;
        }

        const planConfig = plan
            ? PLAN_PRICES[plan]
            : Object.values(PLAN_PRICES).find((p) => p.price && p.price === requested_price_id);

        if (!planConfig?.price) {
            return NextResponse.json(
                { error: "Invalid pricing plan." },
                { status: 400 }
            );
        }

        const price_id = planConfig.price;
        const price_mode = planConfig.mode;

        // Check existing subscription
        const { data: subRow } = await supabase
            .from("user_subscriptions")
            .select("stripe_customer_id, current_plan, renews_at")
            .eq("user_id", user.id)
            .maybeSingle();

        const activePlan = resolvePlan(subRow);

        // If already on an active subscription, don't allow checkout (a lapsed one can re-subscribe)
        if (activePlan === 'pro' || activePlan === 'sentinel') {
            return NextResponse.json(
                { error: "You already have an active subscription." },
                { status: 400 }
            );
        }

        // Buster users can upgrade to pro/sentinel — only block re-buying buster
        if (activePlan === 'buster' && price_mode === 'payment') {
            return NextResponse.json(
                { error: "You already own The Buster. Upgrade to Pro for unlimited access." },
                { status: 400 }
            );
        }

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

        // Stripe needs the promotion code's ID (promo_…), not the customer-facing code string
        let referralPromotionCodeId: string | null = null;
        if (referrerStripeCustomerId) {
            const promos = await stripe.promotionCodes.list({ code: 'SWEEP50', active: true, limit: 1 });
            referralPromotionCodeId = promos.data[0]?.id ?? null;
            if (!referralPromotionCodeId) console.warn("Referral promotion code SWEEP50 not found or inactive");
        }
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
            // Stripe rejects allow_promotion_codes and discounts together
            ...(referralPromotionCodeId
                ? { discounts: [{ promotion_code: referralPromotionCodeId }] }
                : { allow_promotion_codes: true }),
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