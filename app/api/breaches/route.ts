import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";


export async function GET() {
    const supabase = await createClient();
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // get user subscription current plan
    const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("user_subscriptions")
        .select("current_plan")
        .eq("user_id", user.id)
        .single();
        
    if (subscriptionError && subscriptionError.code !== "PGRST116") {
        console.error("Error fetching user subscription:", subscriptionError);
        return NextResponse.json(
            { error: "Internal Server Error", code: "SUBSCRIPTION_FETCH_ERROR" },
            { status: 500 }
        );
    }

    const { data, error } = await supabase
        .from("user_breaches")
        .select("*")
        .eq("user_id", user.id)

    if (error && error.code !== "PGRST116") {
        console.error("Error fetching user breaches:", error);
        return NextResponse.json(
            { error: "Internal Server Error", code: "BREACHES_FETCH_ERROR" },
            { status: 500 }
        );
    }

    // get the total count without pagination
    const {
        count: breachCount,
    } = await supabase
        .from("user_breaches")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

    const breaches = subscriptionData?.current_plan !== "free" ? (data || []).slice(0, 1) : data || [];

    return NextResponse.json({ breaches: breaches || [], total: breachCount });
}