import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

interface UserBreach {
    id: string;
    user_id: string;
    breach_date: string | null;
    domain: string | null;
    pwn_count: number;
    data_classes: string[] | null;
    is_sensitive: boolean | null;
    raw: Record<string, unknown> | null;
}

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
        .select(`
            id,
            user_id,
            breach:breaches (
                breach_date,
                domain,
                pwn_count,
                data_classes,
                is_sensitive,
                raw
            )
        `)
        .eq("user_id", user.id);

    if (error && error.code !== "PGRST116") {
        console.error("Error fetching user breaches:", error);
        return NextResponse.json(
            { error: "Internal Server Error", code: "BREACHES_FETCH_ERROR" },
            { status: 500 }
        );
    }

    const breaches: UserBreach[] =
        (data ?? []).map((row) => ({
            id: row.id,
            user_id: row.user_id,
            breach_date: row.breach[0]?.breach_date ?? null,
            domain: row.breach[0]?.domain ?? null,
            pwn_count: row.breach[0]?.pwn_count ?? 0,
            data_classes: row.breach[0]?.data_classes ?? null,
            is_sensitive: row.breach[0]?.is_sensitive ?? null,
            raw: (row.breach[0]?.raw as Record<string, unknown>) ?? null,
        }));

    // get the total count without pagination
    const {
        count: breachCount,
    } = await supabase
        .from("user_breaches")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

    const breachesToShow = subscriptionData?.current_plan !== "free" ? (breaches || []).slice(0, 2) : breaches || [];

    return NextResponse.json({ breaches: breachesToShow || [], total: breachCount });
}