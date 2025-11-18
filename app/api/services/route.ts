import { createClient } from "@/utils/supabase/server";
import { type NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // get the query parameters
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const searchQuery = searchParams.get("query") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);

    let query = supabase
        .from("user_services")
        .select(
            `
      id,
      user_id,
      first_seen_at,
      last_seen_at,
      email_count,
      is_breached,
      service:services (
        id,
        name,
        domain,
        default_privacy_email,
        category
      )
    `
        )
        .eq("user_id", user.id)
        .limit(20)
        .range((page - 1) * 20, page * 20 - 1);

    if (searchQuery) {
        query = query.ilike("service.name", `%${searchQuery}%`);
    }
    
    if (category) {
        query = query.eq("service.category", category);
    }

    const { data, error } = await query
        .order("last_seen_at", { ascending: false });;
        

    if (error && error.code !== "PGRST116") {
        console.error("Error fetching user services:", error);
        return NextResponse.json(
            { error: "Internal Server Error", code: "USER_SERVICES_NOT_FOUND" },
            { status: 500 }
        );
    }

    return NextResponse.json({services: data || []});
}