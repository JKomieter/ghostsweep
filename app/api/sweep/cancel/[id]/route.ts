import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const allowedToCancelStatuses = [
    "pending", "processing", "account_discovery", "metadata_extraction", "service_normalisation", "account_classification", "data_ingestion"
]

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()

    // 1) Auth
    const {
        data: { user },
        error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Validate sweepId
    const {id} = await params;
    if (!id) {
        return NextResponse.json({ error: "Missing sweepId" }, { status: 400 });
    }


    // 4) Load sweep (must belong to user)
    const { data: sweep, error: sweepErr } = await supabase
        .from("sweep_events")
        .select("id,user_id,status")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (sweepErr || !sweep) {
        return NextResponse.json({ error: "Sweep not found" }, { status: 404 });
    }

    // 5) Only allow cancel if it’s running (or queued if you have that)
    if (!allowedToCancelStatuses.includes(sweep.status)) {
        return NextResponse.json(
            { error: `Cannot cancel a sweep in status: ${sweep.status}` },
            { status: 409 }
        );
    }

    // 6) Update: request cancellation (worker will pick it up)
    const nowIso = new Date().toISOString();

    const { data: updated, error: updateErr } = await supabase
        .from("sweep_events")
        .update({
            status: "cencelled",
            updated_at: nowIso,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        // avoid racing: only update if it was still running/queued
        .in("status", allowedToCancelStatuses)
        .select("id,status")
        .single();

    if (updateErr || !updated) {
        return NextResponse.json(
            { error: "Failed to request cancellation" },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        sweep: updated,
        message: "Cancellation requested. The sweep will stop shortly.",
    });
}