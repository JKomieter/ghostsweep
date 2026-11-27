import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// The signed-in user's email settings. Only "tips and offers" (upgrade pitches,
// referral offers) can be turned off; scan results and account/security emails always send.

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
        .from("email_preferences")
        .select("marketing_opt_out_at")
        .eq("user_id", user.id)
        .maybeSingle();
    if (error) {
        console.error("email-preferences read failed:", error.message);
        return NextResponse.json({ error: "Could not load email settings." }, { status: 500 });
    }
    return NextResponse.json({ marketing: !data?.marketing_opt_out_at });
}

export async function PUT(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as { marketing?: unknown } | null;
    if (typeof body?.marketing !== "boolean") {
        return NextResponse.json({ error: "marketing must be true or false" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const { error } = await supabase
        .from("email_preferences")
        .upsert(
            { user_id: user.id, marketing_opt_out_at: body.marketing ? null : now, updated_at: now },
            { onConflict: "user_id" }
        );
    if (error) {
        console.error("email-preferences update failed:", error.message);
        return NextResponse.json({ error: "Could not save email settings." }, { status: 500 });
    }
    return NextResponse.json({ marketing: body.marketing });
}
