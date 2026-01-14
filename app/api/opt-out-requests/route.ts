// app/api/opt-out-requests/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
    const supabase = await createClient();

    // 1) Auth
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Get all opt-out requests for user
    const { data: requests, error } = await supabase
        .from("opt_out_requests")
        .select(`
      *,
      broker:data_brokers (
        id,
        name,
        type,
        category,
        removal_url,
        contact_email
      )
    `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        return Response.json({ error: "Failed to load requests" }, { status: 500 });
    }

    // Calculate progress stats
    const stats = {
        total: requests.length,
        not_started: requests.filter((r) => r.status === "not_started").length,
        in_progress: requests.filter((r) => r.status === "in_progress").length,
        completed: requests.filter((r) => r.status === "completed").length,
        failed: requests.filter((r) => r.status === "failed").length,
    };

    const progress = {
        completed: stats.completed,
        inProgress: stats.in_progress,
        total: stats.total,
        percentage: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    };

    const completedRequests = requests.filter((r) => r.status === "completed");
    let averageResponseTime = undefined;

    if (completedRequests.length > 0) {
        const totalDays = completedRequests.reduce((sum, r) => {
            const created = new Date(r.created_at).getTime();
            const updated = new Date(r.updated_at).getTime();
            const days = Math.floor((updated - created) / (1000 * 60 * 60 * 24));
            return sum + days;
        }, 0);
        averageResponseTime = Math.round(totalDays / completedRequests.length);
    }

    return Response.json({
        requests,
        stats,
        progress,
        averageResponseTime,
    });
}