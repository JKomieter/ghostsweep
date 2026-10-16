// Server-side plan resolution. Every API route that gates a paid feature should go through
// here so Buster, Pro and Annual (sentinel) users are treated the same everywhere.
import type { SupabaseClient } from "@supabase/supabase-js";
import { isPaidPlan, type PlanId } from "@/lib/plans";

export type SubscriptionRow = {
    current_plan?: string | null;
    renews_at?: string | null;
    scan_credits_remaining?: number | null;
};

/** Effective plan for a user_subscriptions row (expired subscriptions count as free). */
export function resolvePlan(row: SubscriptionRow | null | undefined): PlanId {
    if (!row?.current_plan) return "free";

    // Buster is a one-time purchase — it never expires, even once credits run out
    if (row.current_plan === "buster") return "buster";

    if (row.current_plan === "pro" || row.current_plan === "sentinel") {
        const renewsAt = row.renews_at ? new Date(row.renews_at) : null;
        return renewsAt && renewsAt > new Date() ? row.current_plan : "free";
    }

    return "free";
}

export async function getUserPlan(supabase: SupabaseClient, userId: string) {
    const { data: row, error } = await supabase
        .from("user_subscriptions")
        .select("current_plan, renews_at, scan_credits_remaining")
        .eq("user_id", userId)
        .maybeSingle();

    const plan = resolvePlan(row);
    return {
        plan,
        hasPaidAccess: isPaidPlan(plan),
        row: row as SubscriptionRow | null,
        error,
    };
}
