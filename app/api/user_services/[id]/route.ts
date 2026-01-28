import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error("Auth error:", userError);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`Fetching user_service ${id} for user ${user.id}`);

    // 1) Fetch the user_service (and the linked global service) WITH OWNERSHIP CHECK
    const { data: userService, error: userServiceError } = await supabase
        .from("user_services")
        .select(
            `
        *,
        service:services (*)
      `
        )
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

    if (userServiceError) {
        console.error("Error fetching user service:", userServiceError);
        return NextResponse.json({ error: "Problem getting user service" }, { status: 500 });
    }

    if (!userService) {
        console.log(`User service ${id} not found for user ${user.id} - may not exist or user doesn't own it`);
        return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    console.log(`Found user_service ${id}`);

    // 2) Fetch user-specific breaches for this service
    const { data: userBreaches, error: userBreachesError } = await supabase
        .from("user_breaches")
        .select(
            `
        *,
        breach:breaches!inner (*)
      `
        )
        .eq("user_id", user.id)
        .eq("service_id", userService.service_id);

    if (userBreachesError) {
        console.error("Error fetching breaches:", userBreachesError);
        return NextResponse.json({ error: "Problem getting breaches" }, { status: 500 });
    }


    // 3) Fetch deletion request (optional)
    const { data: deletionRequest, error: deletionRequestError } = await supabase
        .from("deletion_requests")
        .select("*")
        .eq("user_id", user.id)
        .eq("user_service_id", userService.id)
        .maybeSingle();

    if (deletionRequestError) {
        console.error("Error fetching deletion request:", deletionRequestError);
        return NextResponse.json({ error: "Problem getting deletion request" }, { status: 500 });
    }

    return NextResponse.json(
        {
            userService,
            userBreaches,
            deletionRequest,

        },
        { status: 200 }
    );
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error("Auth error:", userError);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { is_whitelisted } = (body ?? {}) as { is_whitelisted?: unknown };

    if (typeof is_whitelisted !== "boolean") {
        return NextResponse.json(
            { error: "is_whitelisted must be a boolean" },
            { status: 400 }
        );
    }

    console.log(`Updating user_service ${id} for user ${user.id} with is_whitelisted=${is_whitelisted}`);

    const { data: updated, error: updateError } = await supabase
        .from("user_services")
        .update({ is_whitelisted })
        .eq("id", id)
        .eq("user_id", user.id)
        .select(
            `
            *,
            service:services (*)
        `
        )
        .maybeSingle();

    if (updateError) {
        console.error("Error updating user service whitelist:", updateError);
        return NextResponse.json(
            { error: "Problem updating whitelist flag" },
            { status: 500 }
        );
    }

    if (!updated) {
        console.log(`No user_service found with id=${id} for user ${user.id} - may not exist or user doesn't own it`);
        return NextResponse.json({ error: "Service not found or you don't have permission to modify it" }, { status: 404 });
    }

    console.log(`Successfully updated user_service ${id}`);


    return NextResponse.json(
        {
            userService: updated,
        },
        { status: 200 }
    );
}