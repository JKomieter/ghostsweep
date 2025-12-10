// app/api/deletion-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const DEFAULT_PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10), 1);
    const pageSize = Math.min(
        Math.max(parseInt(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE), 10), 1),
        50
    );
    const statusFilter = searchParams.get("status"); // optional: e.g. "sent" or "open"

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Base query
    let query = supabase
        .from("deletion_requests")
        .select(
            `
      id,
      user_id,
      user_service_id,
      status,
      to_address,
      subject,
      sent_at,
      last_checked_at,
      last_reply_at,
      reply_message_id,
      reply_snippet,
      last_notified_status,
      last_notified_at,
      user_service:user_services (
        id,
        service:services (
          id,
          name,
          domain,
          category,
          contact,
          is_breached
        )
      )
    `,
            { count: "exact" }
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, to);

    if (statusFilter === "open") {
        // sent, received, needs_verification, in_progress
        query = query.in("status", [
            "sent",
            "received",
            "needs_verification",
            "in_progress",
        ]);
    } else if (statusFilter) {
        // single status filter
        query = query.eq("status", statusFilter);
    }

    const { data, error, count } = await query;

    if (error && error.code !== "PGRST116") {
        console.error("Error fetching privacy requests:", error);
        return NextResponse.json(
            { error: "Failed to fetch privacy requests" },
            { status: 500 }
        );
    }

    return NextResponse.json({
        requests: data ?? [],
        total: count ?? 0,
        page,
        pageSize,
    });
}