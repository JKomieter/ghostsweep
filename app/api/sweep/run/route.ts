// app/api/sweep/run/route.ts (in your Next.js app)
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // ✅ Get user from session (this is automatic in Next.js)
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ User ID comes from the authenticated session
    const userId = user.id;

      // ✅ ENFORCE: Check if sweep already in progress
      const { data: existingSweep, error: sweepCheckError } = await supabase
          .from("sweep_events")
          .select("id, status, started_at")
          .eq("user_id", user.id)
          .in("status", ["pending", "processing"])
          .order("created_at", { ascending: false })
          .maybeSingle();

      if (sweepCheckError && sweepCheckError.code !== "PGRST116") {
          console.error("Error checking existing sweeps:", sweepCheckError);
          return NextResponse.json(
              { error: "Failed to check sweep status" },
              { status: 500 }
          );
      }

      if (existingSweep) {
          // Calculate how long it's been running
          const elapsed = Date.now() - new Date(existingSweep.started_at).getTime();
          const minutesElapsed = Math.floor(elapsed / 60000);

          return NextResponse.json(
              {
                  error: "Sweep already in progress",
                  code: "SWEEP_IN_PROGRESS",
                  sweepId: existingSweep.id,
                  status: existingSweep.status,
                  minutesElapsed,
                  message: `A sweep is already ${existingSweep.status}. Please wait for it to complete (${minutesElapsed} minutes elapsed).`,
              },
              { status: 409 } // 409 Conflict
          );
      }

    // Check if Gmail connected
    const { data: gmailAccount } = await supabase
      .from("gmail_accounts")
      .select("gmail_address")
      .eq("user_id", userId)
      .maybeSingle();

    if (!gmailAccount) {
      return NextResponse.json(
        { error: "No Gmail account connected", code: "GMAIL_ACCOUNT_NOT_FOUND" },
        { status: 404 }
      );
    }

    // ✅ Create sweep job with user_id
    const { data: sweepEvent, error: sweepError } = await supabase
      .from("sweep_events")
      .insert({
        user_id: userId,  // ← User ID stored here
        status: "pending",
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (sweepError || !sweepEvent) {
      return NextResponse.json(
        { error: "Failed to create sweep job" },
        { status: 500 }
      );
    }

    // ✅ Return immediately - worker picks it up
    return NextResponse.json(
      {
        message: "Sweep queued successfully",
        sweepId: sweepEvent.id,
        status: "pending",
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Error starting sweep:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}