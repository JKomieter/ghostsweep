import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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


    // 2) Fetch all user services for this user
    const { data, error } = await supabase
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
    `
        )
        .eq("user_id", user.id)
        // latest deletion request first
        .order("updated_at", {
            referencedTable: "deletion_requests",
            ascending: false,
        });

    if (error) {
        console.error("Error loading user_services:", error);
        return NextResponse.json(
            { error: "Failed to load user services" },
            { status: 500 }
        );
    }

    // 3) Normalize shape (important for frontend stability)
    const userServices = (data ?? []).map((row) => {
        const service = Array.isArray(row.service) ? row.service[0] : row.service
        const deletion_request = Array.isArray(row.deletion_request) ? row.deletion_request[0] : row.deletion_request
        return {
            id: row.id,
            user_id: row.user_id,
            service_id: row.service_id,

            email_count: row.email_count ?? 0,
            first_seen_at: row.first_seen_at,
            last_seen_at: row.last_seen_at,

            service: row.service
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
            deletion_request
        }
    });

    return NextResponse.json(
        {
            userServices,
            total: userServices.length,
        },
        { status: 200 }
    );
}