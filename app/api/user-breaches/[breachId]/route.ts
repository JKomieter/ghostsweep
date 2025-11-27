import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ breachId: string }> }
) {
    const { breachId } = await params;

    if (!breachId) {
        return NextResponse.json(
            { error: "Breach ID is required" },
            { status: 400 }
        );
    }

    const supabase = await createClient();

    // 1) Auth
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Fetch the user_breaches row (this ties user + service + breach together)
    const {
        data: userBreach,
        error: userBreachError,
    } = await supabase
        .from("user_breaches")
        .select("id, user_id, service_id, breach_id, email")
        .eq("id", breachId)
        .eq("user_id", user.id)
        .single();

    if (userBreachError) {
        console.error("Error fetching user_breach:", userBreachError);
        const status = userBreachError.code === "PGRST116" ? 404 : 500;
        return NextResponse.json(
            { error: "Breach not found" },
            { status }
        );
    }

    // 3) Fetch the global breach record
    const {
        data: breach,
        error: breachError,
    } = await supabase
        .from("breaches")
        .select(
            `
                id,
                domain,
                breach_date,
                pwn_count,
                data_classes,
                is_sensitive,
                raw
            `
        )
        .eq("id", userBreach.breach_id)
        .single();

    if (breachError) {
        console.error("Error fetching breach:", breachError);
        const status = breachError.code === "PGRST116" ? 404 : 500;
        return NextResponse.json(
            { error: "Breach details not found" },
            { status }
        );
    }

    // 4) Fetch the full service definition for this user_breach
    const {
        data: service,
        error: serviceError,
    } = await supabase
        .from("services")
        .select(
            `
                id,
                name,
                domain,
                default_privacy_email,
                category,
                is_breached
            `
        )
        .eq("id", userBreach.service_id)
        .single();

    if (serviceError && serviceError.code !== "PGRST116") {
        console.error("Error fetching service for breach:", serviceError);
        const status =  500;
        return NextResponse.json(
            { error: "Service for this breach not found" },
            { status }
        );
    }

    // 5) (Optional) Fetch latest privacy request for this service (if you want it in the sheet)
    const {
        data: privacyRequest,
        error: privacyError,
    } = await supabase
        .from("privacy_requests")
        .select("id, action, status, sent_at, last_reply_at, last_notified_status")
        .eq("user_id", user.id)
        .eq("service_id", userBreach.service_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (privacyError && privacyError.code !== "PGRST116") {
        console.error("Error fetching privacy request:", privacyError);
    }

    // 6) Shape response for your BreachDetailsSheet
    return NextResponse.json(
        {
            breach: {
                // user_breaches context
                user_breach_id: userBreach.id,
                user_id: userBreach.user_id,
                user_email: userBreach.email,
                breach_id: userBreach.breach_id,
                service_id: userBreach.service_id,
                // the global breach record
                details: breach,
            },
            service,
            privacy_request: privacyRequest ?? null,
        },
        { status: 200 }
    );
}