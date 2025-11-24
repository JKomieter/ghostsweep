import { createClient } from "@/utils/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // get user subscription current plan
    const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("user_subscriptions")
        .select("current_plan")
        .eq("user_id", user.id)
        .single();

    if (subscriptionError && subscriptionError.code !== "PGRST116") {
        console.error("Error fetching user subscription:", subscriptionError);
        return NextResponse.json(
            { error: "Internal Server Error", code: "SUBSCRIPTION_FETCH_ERROR" },
            { status: 500 }
        );
    }

    // get the query parameters
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const searchQuery = searchParams.get("query") || "";
    const category = searchParams.get("category") || "";
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
        .from("user_services")
        .select(
            `
            id,
            user_id,
            first_seen_at,
            last_seen_at,
            email_count,
            service:services!inner (
                id,
                name,
                domain,
                default_privacy_email,
                category,
                is_breached
            )
        `
        )
        .eq("user_id", user.id)
        .order("last_seen_at", { ascending: false })

    // filter by service name (and optionally domain) on the related table
    if (searchQuery) {
        // name OR domain match
        query = query.or(
            `services.name.ilike.%${searchQuery}%,services.domain.ilike.%${searchQuery}%`
        );
    }

    if (category) {
        query = query.eq("services.category", category);
    }

    
    // apply pagination
    query = query.range(from, to);
    
    const { data, error } = await query;

    // get the total count without pagination
    const {
        count: serviceCount,
    } = await supabase
        .from("user_services")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

    if (error) {
        console.error("Error fetching user services:", error);
        return NextResponse.json(
            { error: "Internal Server Error", code: "USER_SERVICES_NOT_FOUND" },
            { status: 500 }
        );
    }

    const services = subscriptionData?.current_plan !== "pro" ? (data || []).slice(0, 15) : data;

    return NextResponse.json({ services: services || [], total: serviceCount });
}