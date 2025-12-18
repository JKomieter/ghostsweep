// app/api/deletion-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const DEFAULT_PAGE_SIZE = 20;

const OPEN_STATUSES = ["sent", "received", "needs_verification", "in_progress"] as const;

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

    // optional:
    // - status=open
    // - status=sent|received|...
    const statusFilter = searchParams.get("status");

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from("deletion_requests")
        .select(
            `
      id,
      user_id,
      user_service_id,
      status,
      deletion_method,
      sender_email,
      receiver_email,
      sent_at,
      completed_at,
      created_at,
      updated_at,
      last_reply_at,
      last_reply_snippet,
      follow_up_count,
      next_follow_up_at,
      user_notes,
      template_used,
      gmail_message_id,
      thread_id,

      user_service:user_services (
        id,
        service_id,
        service:services (
          id,
          name,
          domain,
          logo_url,
          category,
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
        query = query.in("status", [...OPEN_STATUSES]);
    } else if (statusFilter) {
        query = query.eq("status", statusFilter);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error("Error fetching deletion requests:", error);
        return NextResponse.json({ error: "Failed to fetch deletion requests" }, { status: 500 });
    }

    return NextResponse.json({
        requests: data ?? [],
        total: count ?? 0,
        page,
        pageSize,
    });
}