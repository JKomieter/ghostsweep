import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
    const supabase = await createClient();

    // 1) Auth
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Get profile.is_new_user
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_new_user")
        .eq("user_id", user.id)
        .maybeSingle();

    if (profileError) {
        console.error("profiles read error:", profileError);
        return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
    }

    const isNewUser = Boolean(profile?.is_new_user);

    // 3) Check if user has at least one sweep event (exists check)
    //    NOTE: change "sweep_events" to your actual table name.
    const { data: sweepRows, error: sweepError } = await supabase
        .from("sweep_events")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

    if (sweepError) {
        console.error("sweep_events read error:", sweepError);
        return NextResponse.json({ error: "Failed to check sweep history" }, { status: 500 });
    }

    const hasSweepEvent = (sweepRows?.length ?? 0) > 0;

    // 4) Decide
    const shouldShowPopup = isNewUser && !hasSweepEvent;

    // set the is_new_user to false if we are showing the popup
    if (shouldShowPopup) {
        const { error: updateError } = await supabase
            .from("profiles")
            .update({ is_new_user: false })
            .eq("user_id", user.id);

        if (updateError) {
            console.error("profiles update error:", updateError);
            return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
        }
    }

    return NextResponse.json(
        {
            shouldShowPopup,
            isNewUser,
            hasSweepEvent,
        },
        { status: 200 }
    );
}