import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"


export async function GET(request: Request) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json(
            { referral_code: null },
            { status: 200 },
        )
    }

    const { data: subRow, error } = await supabase
        .from("user_subscriptions")
        .select("referral_code")
        .eq("user_id", user.id)
        .maybeSingle()

    if (error) {
        console.error("Error fetching subscription row:", error)
        return NextResponse.json({ referral_code: null }, { status: 200 })
    }

    return NextResponse.json({ referral_code: subRow?.referral_code || null }, { status: 200 })
}