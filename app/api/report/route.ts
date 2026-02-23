import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const baseUrl = process.env.NODE_ENV === "production" ?
"https://ghostsweep-orchestration.fly.dev" :
"http://localhost:4000";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
