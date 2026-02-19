import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";

export async function POST() {
    const supabase = await createClient();
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    console.log("Deleting user ID:", user?.id);

    if (userError) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user?.id) {
        return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    // Cancel Stripe subscription if exists
    try {
        // Get user's subscription from your database
        const { data: subscription } = await supabase
            .from("user_subscriptions") // or whatever your table is called
            .select("stripe_customer_id")
            .eq("user_id", user.id)
            .single();

        // Optional: Delete customer from Stripe entirely
        if (subscription?.stripe_customer_id) {
            await stripe.customers.del(subscription.stripe_customer_id);
            console.log("Deleted Stripe customer:", subscription.stripe_customer_id);
        }
    } catch (stripeError) {
        console.error("Error cancelling Stripe subscription:", stripeError);
        // Don't fail user deletion if Stripe fails
        // Just log it and continue
    }

    // Delete user from Supabase
    const { error } = await supabase.functions.invoke("delete-user", {
        body: { userId: user.id },
        headers: {
            "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
        }
    });

    if (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }

    return NextResponse.json({ message: "Account and subscription deleted successfully" });
}
