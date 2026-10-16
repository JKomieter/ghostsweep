// app/api/plan/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getUserPlan } from "@/lib/entitlements"
import type { PlanResponse } from "@/lib/plans"

export async function GET() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json<PlanResponse>({ current_plan: "free" }, { status: 200 })
    }

    const { plan, row, error } = await getUserPlan(supabase, user.id)

    if (error) {
        console.error("Error fetching subscription row:", error)
        // Safest default: treat as free
        return NextResponse.json<PlanResponse>({ current_plan: "free" }, { status: 200 })
    }

    // Subscription lapsed – downgrade in DB so the row matches what we report
    if (plan === "free" && (row?.current_plan === "pro" || row?.current_plan === "sentinel")) {
        await supabase.functions.invoke('downgrade-user-subscription', {
            body: { userId: user.id },
            headers: {
                "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
            }
        })
    }

    return NextResponse.json<PlanResponse>({
        current_plan: plan,
        scan_credits_remaining: plan === "buster" ? (row?.scan_credits_remaining ?? 0) : undefined,
        renews_at: plan === "pro" || plan === "sentinel" ? (row?.renews_at ?? null) : null,
    }, { status: 200 })
}
