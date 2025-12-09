// app/api/deletion-requests /route.ts
import { createClient } from "@/utils/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { user_service_id, to_address, subject } = body

    if (!user_service_id) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const { error } = await supabase.from("deletion_requests").upsert({
        user_id: user.id,
        user_service_id,
        to_address: to_address ?? null,
        subject: subject ?? null,
        sent_at: new Date().toISOString(),
        status: "sent",
        updated_at: new Date().toISOString(),
    }, { onConflict: "user_id, user_service_id" })

    if (error) {
        console.error("Failed to save deletion request: ", error)
        return NextResponse.json({ error: "Failed to save" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}