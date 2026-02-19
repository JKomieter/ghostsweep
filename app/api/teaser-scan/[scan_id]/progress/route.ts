import { NextRequest } from "next/server";

const ORCHESTRATION_URL = process.env.NODE_ENV === "production" ?
    "https://ghostsweep-orchestration.fly.dev" :
    "http://localhost:4000";

// Use Node.js runtime for long-lived SSE connections (no edge timeout)
export const runtime = "nodejs";
// This route should not be statically optimised
export const dynamic = "force-dynamic";

/**
 * Proxy the orchestration SSE stream so the browser doesn't hit CORS issues.
 * GET /api/teaser-scan/{scan_id}/progress  →  GET orchestration/api/scan/teaser/{scan_id}/progress
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ scan_id: string }> }
) {
  const { scan_id } = await params;

  // Validate scan_id is a UUID to prevent path traversal / injection
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_REGEX.test(scan_id)) {
    return new Response(
      JSON.stringify({ error: "Invalid scan ID" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const upstream = await fetch(
    `${ORCHESTRATION_URL}/api/scan/teaser/${scan_id}/progress`,
    {
      headers: { Accept: "text/event-stream" },
      cache: "no-store",
    }
  );

  if (!upstream.ok || !upstream.body) {
    return new Response(
      JSON.stringify({ error: "Failed to connect to scan stream" }),
      { status: upstream.status || 502, headers: { "Content-Type": "application/json" } }
    );
  }

  // Create a TransformStream so chunks are flushed immediately
  const { readable, writable } = new TransformStream();

  // Pipe in the background — don't await (keeps the stream open)
  upstream.body.pipeTo(writable).catch(() => {
    // upstream closed — ignore
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
