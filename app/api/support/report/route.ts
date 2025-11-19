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

    const { email, issueType, summary } = await req.json()

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