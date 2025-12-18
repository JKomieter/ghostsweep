import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * MVP metrics route (updated to match new schema/flow):
 * - user_services count
 * - user_breaches count
 * - last sweep date (sweep_events)
 * - deletion_requests: pending / responded / completed
 *
 * Notes:
 * - Removed last_reply_at (no longer in your DeletionRequest columns)
 * - “Responded” is now inferred by: status === 'received' OR thread_id IS NOT NULL
 * - Pending includes: drafted/sent/received/needs_verification/in_progress
 * - Completed includes: completed
 */
export async function GET() {
    const supabase = await createClient();

    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            if (userError) console.error("Error getting user:", userError);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1) Number of services
        const { count: serviceCount, error: serviceError } = await supabase
            .from("user_services")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

        if (serviceError && serviceError.code !== "PGRST116") {
            console.error("Error counting user_services:", serviceError);
            return NextResponse.json(
                { error: "Failed to fetch service count" },
                { status: 500 }
            );
        }

        // 2) Number of breaches
        const { count: breachCount, error: breachError } = await supabase
            .from("user_breaches")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

        if (breachError && breachError.code !== "PGRST116") {
            console.error("Error counting user_breaches:", breachError);
            return NextResponse.json(
                { error: "Failed to fetch breach count" },
                { status: 500 }
            );
        }

        // 3) Last scan date
        const { data: lastScan, error: lastScanError } = await supabase
            .from("sweep_events")
            .select("created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);

        if (lastScanError && lastScanError.code !== "PGRST116") {
            console.error("Error fetching last scan:", lastScanError);
            return NextResponse.json(
                { error: "Failed to fetch last scan date" },
                { status: 500 }
            );
        }

        const lastScanDate =
            lastScan && lastScan.length > 0 ? lastScan[0].created_at : null;

        // 4) Pending deletion requests
        // (MVP: anything not finalized yet)
        const { count: pendingRequestsCount, error: pendingRequestsError } =
            await supabase
                .from("deletion_requests")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id)
                .in("status", ["drafted", "sent", "received", "needs_verification", "in_progress"]);

        if (pendingRequestsError && pendingRequestsError.code !== "PGRST116") {
            console.error("Error fetching pending requests:", pendingRequestsError);
            return NextResponse.json(
                { error: "Failed to fetch pending requests" },
                { status: 500 }
            );
        }

        // 5) Responded requests
        // New schema has no last_reply_at/reply_snippet.
        // We treat “responded” as:
        // - status == 'received' (you set it when you detect reply)
        // OR
        // - thread_id is not null (thread linked)
        const { count: respondedRequestsCount, error: respondedRequestsError } =
            await supabase
                .from("deletion_requests")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id)
                .or("status.eq.received,thread_id.not.is.null");

        if (respondedRequestsError && respondedRequestsError.code !== "PGRST116") {
            console.error("Error fetching responded requests:", respondedRequestsError);
            return NextResponse.json(
                { error: "Failed to fetch responded requests" },
                { status: 500 }
            );
        }

        // 6) Completed requests (nice dashboard metric)
        const { count: completedRequestsCount, error: completedRequestsError } =
            await supabase
                .from("deletion_requests")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id)
                .eq("status", "completed");

        if (completedRequestsError && completedRequestsError.code !== "PGRST116") {
            console.error("Error fetching completed requests:", completedRequestsError);
            return NextResponse.json(
                { error: "Failed to fetch completed requests" },
                { status: 500 }
            );
        }

        // 7) Security score (unchanged)
        const { data: securityScore, error: securityScoreError } = await supabase
            .from("user_security_scores")
            .select("score, last_calculated_at")
            .eq("user_id", user.id)
            .single();

        if (securityScoreError && securityScoreError.code !== "PGRST116") {
            console.error("Error fetching score:", securityScoreError);
            return NextResponse.json(
                { error: "Failed to fetch security score" },
                { status: 500 }
            );
        }

        const numericScore =
            typeof securityScore?.score === "number"
                ? securityScore.score
                : Number(securityScore?.score ?? 100);

        const grade =
            numericScore >= 90
                ? "A"
                : numericScore >= 75
                    ? "B"
                    : numericScore >= 60
                        ? "C"
                        : numericScore >= 40
                            ? "D"
                            : "F";

        return NextResponse.json({
            service_count: serviceCount ?? 0,
            breach_count: breachCount ?? 0,
            last_scan_date: lastScanDate,
            deletion_requests: {
                pending: pendingRequestsCount ?? 0,
                responded: respondedRequestsCount ?? 0,
                completed: completedRequestsCount ?? 0,
            },
            security_score: {
                score: numericScore,
                grade,
                last_calculated_at: securityScore?.last_calculated_at ?? null,
            },
        });
    } catch (error) {
        console.error("Error fetching user metrics:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}