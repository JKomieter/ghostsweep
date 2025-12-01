import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();

        // ✅ Get user from session
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // ✅ Fetch latest sweep for this user (by created_at)
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
                completed_at
            `
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (sweepError && sweepError.code !== "PGRST116") {
            console.error("Error fetching latest sweep:", sweepError);
            return NextResponse.json(
                { error: "Failed to fetch latest sweep" },
                { status: 500 }
            );
        }

        // No sweep found for this user
        if (!sweep) {
            return NextResponse.json({
                sweepId: null,
                status: null,
                progress: null,
                servicesFound: null,
                breachesFound: null,
                errorMessage: null,
                startedAt: null,
                completedAt: null,
                message: "No sweep has been started yet.",
            });
        }

        // Map DB fields → API shape
        return NextResponse.json({
            sweepId: sweep.id as string,
            status: sweep.status as "pending" | "processing" | "completed" | "failed",
            progress: sweep.progress ?? null,
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
            { status: 500 }
        );
    }
}