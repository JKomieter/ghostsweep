// app/api/sweep/status/latest/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const PHASE_META: Record<
    string,
    { label: string; step: number; totalSteps: number }
> = {
    listing_messages: { label: "Listing account-related emails", step: 1, totalSteps: 5 },
    processing_metadata: { label: "Processing email metadata", step: 2, totalSteps: 5 },
    service_normalisation: { label: "Grouping services by domain", step: 3, totalSteps: 5 },
    account_classification: { label: "Classifying accounts", step: 4, totalSteps: 5 },
    data_ingestion: { label: "Saving results", step: 5, totalSteps: 5 },
};

type NormalizedStatus = "pending" | "processing" | "completed" | "failed";

function normalizeStatus(raw: string | null): NormalizedStatus | null {
    if (!raw) return null;
    if (raw === "pending") return "pending";
    if (raw === "completed") return "completed";
    if (raw === "failed") return "failed";
    // any phase status counts as "processing"
    return "processing";
}

export async function GET() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: sweep, error: sweepError } = await supabase
            .from("sweep_events")
            .select(
                `
        id,
        status,
        progress,
        services_found,
        breaches_found,
        error_message,
        started_at,
        completed_at,
        messages_processed,
        is_read
      `,
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (sweepError && sweepError.code !== "PGRST116") {
            console.error("Error fetching latest sweep:", sweepError);
            return NextResponse.json(
                { error: "Failed to fetch latest sweep" },
                { status: 500 },
            );
        }

        if (!sweep) {
            return NextResponse.json({
                sweepId: null,
                status: null,
                progress: null,
                phase: null,
                phaseLabel: null,
                phaseStep: null,
                phaseCount: null,
                messagesProcessed: null,
                servicesFound: null,
                breachesFound: null,
                errorMessage: null,
                startedAt: null,
                completedAt: null,
                message: "No sweep has been started yet.",
            });
        }

        const rawStatus: string | null = sweep.status;
        const normalizedStatus = normalizeStatus(rawStatus);
        const phaseMeta = PHASE_META[rawStatus ?? ""] ?? null;

        // (Optional) mark as read only when not processing
        if (!sweep.is_read && normalizedStatus !== "processing") {
            await supabase
                .from("sweep_events")
                .update({ is_read: true })
                .eq("id", sweep.id);
        }

        return NextResponse.json({
            sweepId: sweep.id as string,
            status: normalizedStatus,
            progress: sweep.progress ?? 0,
            phase: rawStatus, // e.g. "listing_messages"
            phaseLabel: phaseMeta?.label ?? null,
            phaseStep: phaseMeta?.step ?? null,
            phaseCount: phaseMeta?.totalSteps ?? null,
            messagesProcessed: sweep.messages_processed ?? 0,
            servicesFound: sweep.services_found ?? null,
            breachesFound: sweep.breaches_found ?? null,
            errorMessage: sweep.error_message ?? null,
            startedAt: sweep.started_at ?? null,
            completedAt: sweep.completed_at ?? null,
            message: undefined,
        });
    } catch (error) {
        console.error("Error getting latest sweep:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}