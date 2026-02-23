// app/api/plan/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json(
            { current_plan: "free" },
            { status: 200 },
        )
    }

    const { data: subRow, error } = await supabase
        .from("user_subscriptions")
        .select("current_plan, renews_at, trial_started_at, scan_credits_remaining")
        .eq("user_id", user.id)
        .maybeSingle()

    if (error) {
        console.error("Error fetching subscription row:", error)
        // Safest default: treat as free
        return NextResponse.json({ current_plan: "free", has_used_trial: false }, { status: 200 })
    }

    if (!subRow) {
        return NextResponse.json({ current_plan: "free", has_used_trial: false }, { status: 200 })
    }

    let effectivePlan: "free" | "pro" = "free"

    const hasUsedTrial = subRow.trial_started_at !== null

    // Buster — one-time purchase, credits count down, no expiry check
    if (subRow.current_plan === "buster") {
        return NextResponse.json({
            current_plan: "buster",
            scan_credits_remaining: subRow.scan_credits_remaining ?? 0,
            has_used_trial: hasUsedTrial,
        }, { status: 200 })
    }

    if (subRow.current_plan === "pro") {
        const now = new Date()
        const renewsAt = subRow.renews_at ? new Date(subRow.renews_at) : null

        if (renewsAt && renewsAt > now) {
            // ✅ Still within paid period
            effectivePlan = "pro"
        } else {
            // ⛔ Expired – optional: downgrade in DB
            effectivePlan = "free"

            // Fire-and-forget downgrade
            await supabase.functions.invoke('downgrade-user-subscription', {
                body: { userId: user.id },
                headers: {
                    "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
                }
            })
        }
    }

    return NextResponse.json({ current_plan: effectivePlan, has_used_trial: hasUsedTrial }, { status: 200 })
}