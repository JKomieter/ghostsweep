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

    // 🔴 IMPORTANT: make the relationship explicit + include breach_id
    const { data: userBreach, error: userBreachError } = await supabase
        .from("user_breaches")
        .select(
            `
            id,
            user_id,
            breach_id,
            breach:breaches (
                id,
                breach_date,
                domain,
                pwn_count,
                data_classes,
                is_sensitive,
                description,
                raw
            )
        `
        )
        .eq("user_id", user.id);

    if (userBreachError && userBreachError.code !== "PGRST116") {
        console.error("Error fetching user breaches:", userBreachError);
        return NextResponse.json(
            { error: "Internal Server Error", code: "BREACHES_FETCH_ERROR" },
            { status: 500 }
        );
    }

    
    const breaches: UserBreach[] = (userBreach ?? []).map((row) => {
        // For this relationship, breach should be a single object, not array
        const breach =
            (Array.isArray(row.breach) ? row.breach[0] : row.breach) ?? {};

        return {
            id: row.id,
            user_id: row.user_id,
            breach_date: breach?.breach_date ?? null,
            domain: breach?.domain ?? null,
            pwn_count: breach?.pwn_count ?? 0,
            data_classes: breach?.data_classes ?? null,
            is_sensitive: breach?.is_sensitive ?? null,
            raw: (breach?.raw as Record<string, unknown>) ?? null,
        };
    });

    // total count
    const { count: breachCount } = await supabase
        .from("user_breaches")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

    const isFree = subscriptionData?.current_plan === "free";
    const breachesToShow = isFree ? breaches.slice(0, 2) : breaches;

    return NextResponse.json({
        breaches: breachesToShow,
        total: breachCount ?? 0,
    });
}