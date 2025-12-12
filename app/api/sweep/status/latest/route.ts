// app/api/sweep/status/latest/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Map worker statuses -> nice labels + steps
const PHASE_META: Record<
    string,
    { label: string; step: number; count: number }
> = {
    account_discovery: {
        label: "Discovering account-related emails",
        step: 1,
        count: 5,
    },
    metadata_extraction: {
        label: "Extracting email metadata",
        step: 2,
        count: 5,
    },
    service_normalisation: {
        label: "Analyzing services & domains",
        step: 3,
        count: 5,
    },
    account_classification: {
        label: "Classifying accounts & spam",
        step: 4,
        count: 5,
    },
    data_ingestion: {
        label: "Saving accounts, breaches & metrics",
        step: 5,
        count: 5,
    },
};

export async function GET() {
    try {
        const supabase = await createClient();

        // ✅ Get user from session
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ✅ Fetch latest unread sweep for this user
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
        messages_processed
      `,
            )
            .eq("user_id", user.id)
            .eq("is_read", false)
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

        // If nothing unread, return "no sweep"
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

        // Mark as read (fire-and-forget, but we still await here)
        await supabase
            .from("sweep_events")
            .update({ is_read: true })
            .eq("id", sweep.id);

        const rawStatus = sweep.status as string;

        // Map DB status -> high-level status + phase fields
        let status: "pending" | "processing" | "completed" | "failed" | null = null;
        let phase: string | null = null;
        let phaseLabel: string | null = null;
        let phaseStep: number | null = null;
        let phaseCount: number | null = null;

        if (rawStatus === "pending") {
            status = "pending";
        } else if (rawStatus === "completed" || rawStatus === "failed") {
            status = rawStatus;
        } else if (PHASE_META[rawStatus]) {
            // Any of the phase statuses => treat as processing
            status = "processing";
            phase = rawStatus;
            phaseLabel = PHASE_META[rawStatus].label;
            phaseStep = PHASE_META[rawStatus].step;
            phaseCount = PHASE_META[rawStatus].count;
        } else {
            // Fallback: unknown non-terminal status = processing
            status = "processing";
        }

        return NextResponse.json({
            sweepId: sweep.id as string,
            status,                       // "pending" | "processing" | "completed" | "failed"
            progress: sweep.progress ?? null,
            phase,
            phaseLabel,
            phaseStep,
            phaseCount,
            messagesProcessed: sweep.messages_processed ?? null,
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