import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ORCHESTRATION_URL = "https://ghostsweep-orchestration.fly.dev";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 3 teaser scans per day per IP
const teaserLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(3, "1 d"),
  prefix: "teaser-scan",
  analytics: false,
});

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);

    // Rate limit check
    const { success, remaining, reset } = await teaserLimit.limit(ip);
    if (!success) {
      const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      return NextResponse.json(
        {
          error: "You've reached the daily limit of 3 free scans. Sign up for unlimited scans.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

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
    return NextResponse.json(
      { ...data, scans_remaining: remaining },
      { status: 202 }
    );
  } catch (error) {
    console.error("Teaser scan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
