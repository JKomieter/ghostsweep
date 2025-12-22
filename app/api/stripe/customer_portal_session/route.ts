import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
        return NextResponse.json({ error: "Failed to load subscription" }, { status: 500 });
    }

    const stripeCustomerId = subscription?.stripe_customer_id;

    if (!stripeCustomerId) {
        return NextResponse.json({ error: "No Stripe customer ID found" }, { status: 400 });
    }

    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: process.env.NODE_ENV === "development" ?
            "http://localhost:3000/dashboard" :
             "https://www.ghostsweep.com/dashboard",
    });

    return NextResponse.json({ url: portalSession.url });
}