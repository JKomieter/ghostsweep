import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const FREE_LIMIT = 10;

export async function GET() {
    const supabase = await createClient();

    // 1) Auth
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Check plan (adjust table/columns to match your schema)
    // Assumes: user_subscriptions.user_id, current_plan = 'free' | 'pro'
    const { data: sub, error: subErr } = await supabase
        .from("user_subscriptions")
        .select("current_plan")
        .eq("user_id", user.id)
        .maybeSingle();

    if (subErr) {
        console.error("Error loading user subscription:", subErr);
        return NextResponse.json(
            { error: "Failed to load subscription" },
            { status: 500 },
        );
    }

    const isPro = (sub?.current_plan ?? "free") === "pro";
    const limit = isPro ? undefined : FREE_LIMIT;

    // 3) Fetch user services (limit for Free)
    let query = supabase
        .from("user_services")
        .select(
            `
        id,
        user_id,
        service_id,
        email_count,
        first_seen_at,
        last_seen_at,

        service:services (
          id,
          name,
          domain,
          category,
          logo_url,
          is_breached
        ),

        deletion_request:deletion_requests (
          id,
          status,
          sent_at,
          updated_at
        )
      `,
        )
        .eq("user_id", user.id)
        // latest deletion request first
        .order("updated_at", {
            referencedTable: "deletion_requests",
            ascending: false,
        });

    if (typeof limit === "number") {
        query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error loading user_services:", error);
        return NextResponse.json(
            { error: "Failed to load user services" },
            { status: 500 },
        );
    }

    // 4) Normalize shape (important for frontend stability)
    const userServices = (data ?? []).map((row) => {
        const service = Array.isArray(row.service) ? row.service[0] : row.service;
        const deletion_request = Array.isArray(row.deletion_request)
            ? row.deletion_request[0]
            : row.deletion_request;

        return {
            id: row.id,
            user_id: row.user_id,
            service_id: row.service_id,

            email_count: row.email_count ?? 0,
            first_seen_at: row.first_seen_at,
            last_seen_at: row.last_seen_at,

            service: service
                ? {
                    id: service.id,
                    name: service.name,
                    domain: service.domain,
                    category: service.category,
                    logo_url: service.logo_url,
                    is_breached: service.is_breached ?? false,
                }
                : null,

            // only keep the most recent deletion request (if any)
            deletion_request: deletion_request ?? null,
        };
    });

    // 5) Total should represent the real total (even when gated)
    // We do a cheap count query so the UI can say "showing 10 of X".
    const { count, error: countErr } = await supabase
        .from("user_services")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

    if (countErr) {
        console.error("Error counting user_services:", countErr);
        // Non-fatal: fall back to returned length
    }

    const total = typeof count === "number" ? count : userServices.length;

    return NextResponse.json(
        {
            userServices,
            total,
            gated: !isPro, // optional but helpful for frontend
            limit: !isPro ? FREE_LIMIT : null, // optional
        },
        { status: 200 },
    );
}