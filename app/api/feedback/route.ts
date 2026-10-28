import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Post-scan feedback (star rating + optional note). Stored alongside support reports so the
// team reads it in one place. Whether to ask is tracked per account on `profiles`:
// once feedback is sent we never ask again, and "Not now" backs off for a month.
const SNOOZE_DAYS = 30;

export async function GET() {
    const supabase = await createClient();
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("feedback_submitted_at, feedback_snoozed_until")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        // Fail quiet: better to skip asking than to nag someone who already answered
        console.error("profiles feedback read error:", error);
        return NextResponse.json({ shouldAsk: false });
    }

    const snoozedUntil = profile?.feedback_snoozed_until ? new Date(profile.feedback_snoozed_until).getTime() : 0;
    const shouldAsk = Boolean(profile) && !profile?.feedback_submitted_at && Date.now() > snoozedUntil;

    return NextResponse.json({ shouldAsk });
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    // "Not now"
    if (body?.dismissed === true) {
        const { error } = await supabase
            .from("profiles")
            .update({ feedback_snoozed_until: new Date(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000).toISOString() })
            .eq("user_id", user.id);

        if (error) {
            console.error("profiles feedback snooze error:", error);
            return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
        }
        return NextResponse.json({ success: true });
    }

    const rating = Number(body?.rating);
    const note = typeof body?.note === "string" ? body.note.trim() : "";
    const sweepId = typeof body?.sweepId === "string" ? body.sweepId.slice(0, 64) : null;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return NextResponse.json({ error: "rating must be a whole number from 1 to 5" }, { status: 400 });
    }
    if (note.length > 2000) {
        return NextResponse.json({ error: "note must be 2000 characters or fewer" }, { status: 400 });
    }

    const summary = [`Rating: ${rating}/5`, sweepId && `Sweep: ${sweepId}`, note && `\n${note}`]
        .filter(Boolean)
        .join("\n");

    const { error } = await supabase.from("reports").insert({
        email: user.email,
        issue_type: "scan_feedback",
        summary,
        user_id: user.id,
    });

    if (error) {
        console.error("Failed to save feedback", error);
        return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
    }

    const { error: profileError } = await supabase
        .from("profiles")
        .update({ feedback_submitted_at: new Date().toISOString() })
        .eq("user_id", user.id);

    if (profileError) {
        // Feedback is saved; worst case they get asked once more
        console.error("profiles feedback update error:", profileError);
    }

    return NextResponse.json({ success: true });
}
