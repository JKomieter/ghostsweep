import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json()
    const { issueType, summary } = body
    // Always use the authenticated user's email — do not trust user-supplied email
    const email = user.email

    if (!issueType || typeof issueType !== 'string' || issueType.length > 100) {
        return NextResponse.json({ error: 'Invalid issueType' }, { status: 400 })
    }
    if (!summary || typeof summary !== 'string' || summary.trim().length < 10 || summary.length > 5000) {
        return NextResponse.json({ error: 'summary must be between 10 and 5000 characters' }, { status: 400 })
    }

    const { error } = await supabase.from("reports")
        .insert({
            email,
            issue_type: issueType,
            summary,
            user_id: user.id
        })

    if (error) {
        console.error("Failed to send report", error);
        return NextResponse.json(
            { error: "Failed to send report", },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true })
}