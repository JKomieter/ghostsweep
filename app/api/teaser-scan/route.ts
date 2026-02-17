import { NextRequest, NextResponse } from "next/server";

const ORCHESTRATION_URL = "https://ghostsweep-orchestration.fly.dev";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email } = body;

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${ORCHESTRATION_URL}/api/scan/teaser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Teaser scan error:", errorText);
      return NextResponse.json(
        { error: errorText || "Scan failed to start" },
        { status: response.status }
      );
    }

    // Expect { message: "...", scan_id: "uuid" }
    const data = await response.json();
    return NextResponse.json(data, { status: 202 });
  } catch (error) {
    console.error("Teaser scan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
