import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server';
import stripe from '@/lib/stripe';

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

        // Get price_id from request
        const contentType = req.headers.get("content-type") || "";
        let price_id: string | undefined;
        let referral_code: string | undefined;

        if (contentType.includes("application/json")) {
            const body = await req.json();
            price_id = body.price_id;
            referral_code = body.referral_code;
        } else {
            const formData = await req.formData();
            price_id = formData.get("price_id") as string | undefined;
            referral_code = formData.get("referral_code") as string | undefined;
        }

        if (!price_id) {
            return NextResponse.json(
                { error: "Missing price_id" },
                { status: 400 }
            );
        }

        // Check existing subscription
        const { data: subRow } = await supabase
            .from("user_subscriptions")
            .select("stripe_customer_id, current_plan")
            .eq("user_id", user.id)
            .maybeSingle();

        // If already pro, don't allow checkout
        if (subRow?.current_plan === 'pro') {
            return NextResponse.json(
                { error: "You already have an active Professional subscription." },
                { status: 400 }
            );
        }

        let stripeCustomerId = subRow?.stripe_customer_id as string | null;

        // Create Stripe customer if needed
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    supabase_user_id: user.id,
                },
            });

            stripeCustomerId = customer.id;

            // Store customer ID via Edge Function
            const { error: funcError } = await supabase.functions.invoke("update-user-stripeId", {
                body: {
                    userId: user.id,
                    stripeCustomerId,
                },
                headers: {
                    "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
                }
            });

            if (funcError) {
                console.error("Failed to store Stripe customer ID:", funcError);
                // Continue anyway - webhook will handle it
            }
        }

        // get thr user_subscription row for the referrer if referral_code is provided
        let referrerStripeCustomerId: string | null = null;
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
            }
        }

        const shouldApplyReferralDiscount = Boolean(referrerStripeCustomerId);
        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            line_items: [
                {
                    price: price_id,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${origin}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/dashboard/billing?canceled=true`,
            automatic_tax: { enabled: true },
            allow_promotion_codes: shouldApplyReferralDiscount,
            billing_address_collection: 'auto',
            customer_update: {
                address: 'auto',
            },
            ...(shouldApplyReferralDiscount
                ? { discounts: [{ promotion_code: 'SWEEP50' }] }
                : {}),
            metadata: {
                supabase_user_id: user.id,
                price_id,
                ...(referral_code ? { referral_code } : {}),
                ...(referrerStripeCustomerId ? { referrer_stripe_customer_id: referrerStripeCustomerId } : {}),
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