import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await supabase.auth.getSession().then(res => res.data.session?.access_token);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for an already-running scan
    const { data: existingScan } = await supabase
      .from("shadow_scans")
      .select("id, status")
      .eq("user_id", user.id)
      .in("status", ["starting", "scanning", "processing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingScan) {
      return NextResponse.json(
        { error: "A scan is already in progress", scanId: existingScan.id },
        { status: 409 }
      );
    }

    // Check plan — free users limited to 10 scans per week
    const { data: plan } = await supabase
      .from("user_subscriptions")
      .select("current_plan")
      .eq("user_id", user.id)
      .single();

    const isPremium =
      plan?.current_plan === "pro" || plan?.current_plan === "buster";

    if (!isPremium) {
      const oneWeekAgo = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ).toISOString();

      const { count: recentScanCount } = await supabase
        .from("shadow_scans")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", oneWeekAgo);

      if ((recentScanCount ?? 0) >= 10) {
        return NextResponse.json(
          {
            error: "Free plan allows 10 scans per week. Upgrade for unlimited scans.",
          },
          { status: 429 }
        );
      }
    }

    // Create a shadow_scans row
    const { data: scan, error: scanError } = await supabase
      .from("shadow_scans")
      .insert({
        user_id: user.id,
        status: "starting",
        progress: 0,
        found_count: 0,
      })
      .select()
      .single();

    if (scanError || !scan) {
      console.error("Failed to create shadow scan:", scanError);
      return NextResponse.json(
        { error: "Failed to initialize scan" },
        { status: 500 }
      );
    }

    // Trigger the orchestration API with the scan ID
    const response = await fetch(
      `https://ghostsweep-orchestration.fly.dev/scan/${user.id}`,
      {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ scan_id: scan.id }),
      }
    );

    if (!response.ok) {
      // Mark scan as failed if the orchestration API rejects
      await supabase
        .from("shadow_scans")
        .update({ status: "failed", message: "Orchestration service unavailable" })
        .eq("id", scan.id);

      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Scan failed to start" },
        { status: response.status }
      );
    }

    return NextResponse.json({ scanId: scan.id, status: "starting" });
  } catch (error) {
    console.error("Trigger scan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get latest scan for this user
    const { data: scan, error } = await supabase
      .from("shadow_scans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ scan: scan ?? null });
  } catch (error) {
    console.error("Get scan status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
