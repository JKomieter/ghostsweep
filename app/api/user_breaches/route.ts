import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();

    // 1) Auth
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Plan
    const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("user_subscriptions")
        .select("current_plan")
        .eq("user_id", user.id)
        .maybeSingle();

    if (subscriptionError) {
        console.error("Error fetching user subscription:", subscriptionError);
        return NextResponse.json(
            { error: "Internal Server Error", code: "SUBSCRIPTION_FETCH_ERROR" },
            { status: 500 }
        );
    }

    const currentPlan = (subscriptionData?.current_plan || "free") as "free" | "pro";

    // 3) Always compute total count (safe for both tiers)
    const { count: breachCount, error: countError } = await supabase
        .from("user_breaches")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

    if (countError) {
        console.error("Error counting user breaches:", countError);
        return NextResponse.json(
            { error: "Internal Server Error", code: "BREACH_COUNT_ERROR" },
            { status: 500 }
        );
    }

    // 5) Pro tier: return list + count
    const { data: userBreaches, error: listError } = await supabase
        .from("user_breaches")
        .select(
            `
        id,
        user_id,
        breach_id,
        service_id,
        created_at,
        breach:breaches (
          id,
          breach_date,
          domain,
          pwn_count,
          data_classes,
          is_sensitive,
          raw
        )
      `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (listError && listError.code !== "PGRST116") {
        console.error("Error fetching user breaches:", listError);
        return NextResponse.json(
            { error: "Internal Server Error", code: "BREACHES_FETCH_ERROR" },
            { status: 500 }
        );
    }

    return NextResponse.json({
        userBreaches: userBreaches ?? [],
        total: breachCount ?? 0,
        gated: false,
        currentPlan,
    });
}