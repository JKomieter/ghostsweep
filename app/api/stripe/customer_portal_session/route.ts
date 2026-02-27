import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server"
import stripe from "@/lib/stripe"


export async function POST() {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // get the customer id from user subscriptions table
    const { data: subscription, error: subscriptionError } = await supabase
        .from("user_subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (subscriptionError) {
        console.error("Error fetching subscription:", subscriptionError);
        return NextResponse.json({ error: "Failed to load subscription" }, { status: 500 });
    }

    let stripeCustomerId = subscription?.stripe_customer_id as string | null;

    if (!stripeCustomerId) {
        return NextResponse.json({ error: "No Stripe customer ID found" }, { status: 400 });
    }

    // Verify the customer exists in the current Stripe mode (live vs test IDs don't cross over)
    try {
        const existing = await stripe.customers.retrieve(stripeCustomerId);
        if ((existing as { deleted?: boolean }).deleted) {
            stripeCustomerId = null;
        }
    } catch (err: unknown) {
        if ((err as { code?: string })?.code === "resource_missing") {
            console.warn(`Stripe customer ${stripeCustomerId} not found in current mode — stale ID in DB.`);
            stripeCustomerId = null;
        } else {
            console.error("Stripe customer lookup error:", err);
            return NextResponse.json({ error: "Failed to verify billing account" }, { status: 500 });
        }
    }

    if (!stripeCustomerId) {
        return NextResponse.json(
            { error: "No active billing account found. Please contact support." },
            { status: 400 }
        );
    }

    // Create customer portal session
    let portalSession;
    try {
        portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: process.env.NODE_ENV === "development"
                ? "http://localhost:3000/dashboard"
                : "https://www.ghostsweep.com/dashboard",
        });
    } catch (stripeError) {
        console.error("Stripe billing portal error:", stripeError);
        return NextResponse.json({ error: "Failed to create billing portal session" }, { status: 500 });
    }

    return NextResponse.json({ url: portalSession.url });
}