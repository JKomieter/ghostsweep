import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { getUserPlan } from "@/lib/entitlements";
import type { SupabaseClient } from "@supabase/supabase-js";

const baseUrl = process.env.NODE_ENV === "production" ?
"https://ghostsweep-orchestration.fly.dev" :
"http://localhost:4000";

// The privacy report is a paid feature (Buster, Pro, Annual). Free users get a 402 so the
// client can show the upgrade paywall instead of the PDF.
async function requirePaidAccess(supabase: SupabaseClient, userId: string) {
  const { hasPaidAccess } = await getUserPlan(supabase, userId);
  if (hasPaidAccess) return null;
  return NextResponse.json(
    { error: "The privacy report is available on Buster and Pro plans.", code: "UPGRADE_REQUIRED" },
    { status: 402 }
  );
}

/** GET /api/report — returns the user's most recent report URL (fresh signed URL) */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paywall = await requirePaidAccess(supabase, user.id);
    if (paywall) return paywall;

    const token = await supabase.auth.getSession().then(
      (res) => res.data.session?.access_token
    );

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${baseUrl}/api/report/${user.id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 404) {
      return NextResponse.json({ url: null, generatedAt: null });
    }

    if (!res.ok) {
      return NextResponse.json({ url: null, generatedAt: null });
    }

    const data = await res.json();
    // Orchestration returns { url, generatedAt } — pass through
    return NextResponse.json({
      url: data.url ?? null,
      generatedAt: data.generatedAt ?? data.generated_at ?? null,
    });
  } catch (error) {
    console.error("[report] Fetch latest error:", error);
    return NextResponse.json({ url: null, generatedAt: null });
  }
}

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paywall = await requirePaidAccess(supabase, user.id);
    if (paywall) return paywall;

    const token = await supabase.auth.getSession().then(
      (res) => res.data.session?.access_token
    );

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fire-and-forget — orchestration generates the PDF in the background
    // and broadcasts `report_ready` on the Supabase Realtime channel `report:${userId}`
    const res = await fetch(
      `${baseUrl}/api/report/${user.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "Failed to queue report" },
        { status: res.status }
      );
    }

    return NextResponse.json({ queued: true, userId: user.id });
  } catch (error) {
    console.error("[report] Queue error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
