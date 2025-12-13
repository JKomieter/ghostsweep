import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userServiceId: string }> }
) {
    const { userServiceId } = await params;

    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!userServiceId) {
        return NextResponse.json(
            { error: "Service ID is required" },
            { status: 400 }
        );
    }

    // Get the *user-specific* service record for this serviceId
    const { data: userService, error: userServiceError } = await supabase
        .from("user_services")
        .select(
            `
        id,
        user_id,
        service_id,
        first_seen_at,
        last_seen_at,
        email_count,
        service:services!inner (
          id,
          name,
          domain,
          contact,
          category,
          is_breached
        )
      `
        )
        .eq("id", userServiceId)
        .single();

    if (userServiceError && userServiceError.code !== "PGRST116") {
        console.error("Error fetching user service:", userServiceError);
        return NextResponse.json(
            { error: "Problem getting user service" },
            { status: 500 }
        );
    }

    // Get the global service definition (optional, but you seem to want it)
    const {
        data: service,
        error: serviceError,
    } = await supabase
        .from("services")
        .select("*")
        .eq("id", userService?.service_id)
        .single();

    if (serviceError && serviceError.code !== "PGRST116") {
        console.error("Error fetching service:", serviceError);
        return NextResponse.json(
            { error: "Service not found" },
            { status: 404 }
        );
    }

    // Get user-specific breaches for this service
    const { data: userBreaches, error: userBreachesError } = await supabase
        .from("user_breaches")
        .select(
            `
        id,
        email,
        breach:breaches!user_breaches_breach_id_fkey (
          id,
          domain,
          breach_date,
          pwn_count,
          data_classes,
          is_sensitive,
          description,
          raw
        )
      `
        )
        .eq("user_id", user.id)
        .eq("service_id", userService?.service_id);

    if (userBreachesError && userBreachesError.code !== "PGRST116") {
        console.error("Error fetching breaches:", userBreachesError);
        return NextResponse.json(
            { error: "Breaches not found" },
            { status: 404 }
        );
    }

    // Normalize breaches shape
    const breaches =
        userBreaches
            ?.map((b) => {
                // Depending on how Supabase returns this, it might be an object or array.
                const breachRecord = Array.isArray(b.breach)
                    ? b.breach[0]
                    : b.breach;

                if (!breachRecord) return null;

                return {
                    id: b.id, // user_breaches row id
                    email: b.email,
                    breach_id: breachRecord.id,
                    domain: breachRecord.domain,
                    breach_date: breachRecord.breach_date,
                    pwn_count: breachRecord.pwn_count,
                    data_classes: breachRecord.data_classes,
                    is_sensitive: breachRecord.is_sensitive,
                    description: breachRecord.description,
                    raw: breachRecord.raw,
                };
            })
            .filter(Boolean) ?? [];
            console.log("User service", userService)
    const { data: deletionRequest, error: deletionRequestError } = await supabase.from("deletion_requests")
        .select(`
                    id, 
                    status,
                    to_address,
                    subject,
                    sent_at,
                    last_reply_at,
                    reply_snippet
                `)
        .eq("user_id", user.id)
        .eq("user_service_id", userService?.id)
        .single()

    if (deletionRequestError && deletionRequestError.code !== "PGRST116") {
        console.error("Error fetching deletion request:", deletionRequestError);
        return NextResponse.json(
            { error: "Privacy Request not found" },
            { status: 500 }
        );
    }

    const data = {
        ...(userService || {}),
        service,   // global service info
        breaches,  // user-specific breaches for this service
        deletionRequest
    };

    return NextResponse.json({ service: data }, { status: 200 });
}