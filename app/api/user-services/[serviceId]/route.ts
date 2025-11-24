import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ serviceId: string }> }
) {
    const { serviceId } = await params;

    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (!serviceId) {
        return NextResponse.json(
            { error: "Service ID is required" },
            { status: 400 }
        );
    }

    // Get the *user-specific* service record for this serviceId
    const {
        data: userService,
        error: userServiceError,
    } = await supabase
        .from("user_services")
        .select(
            `id, 
            user_id, 
            service_id, 
            first_seen_at, 
            last_seen_at, 
            email_count
            `
        )
        .eq("user_id", user.id)
        .eq("service_id", serviceId)
        .single();

    if (userServiceError && userServiceError.code !== "PGRST116") {
        console.error("Error fetching user service:", userServiceError);
        return NextResponse.json(
            { error: "Problem getting user service" },
            { status: 500 }
        );
    }

    // Get the global service definition
    const {
        data: service,
        error: serviceError,
    } = await supabase
        .from("services")
        .select("*")
        .eq("id", serviceId)
        .single();

    if (serviceError && serviceError.code !== "PGRST116") {
        console.error("Error fetching service:", serviceError);
        return NextResponse.json(
            { error: "Service not found" },
            { status: 404 }
        );
    }
    
    const data = {
        ...(userService || {}),
        service,
    };

    return NextResponse.json({ service: data }, { status: 200 });
}