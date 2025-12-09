import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();

    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
            console.error("Error getting user:", userError);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1) Number of services
        const {
            count: serviceCount,
            error: serviceError,
        } = await supabase
            .from("user_services")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

        if (serviceError) {
            console.error("Error counting user_services:", serviceError);
            return NextResponse.json(
                { error: "Failed to fetch service count" },
                { status: 500 }
            );
        }

        // 2) Number of breaches
        const {
            count: breachCount,
            error: breachError,
        } = await supabase
            .from("user_breaches")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

        if (breachError) {
            console.error("Error counting user_breaches:", breachError);
            return NextResponse.json(
                { error: "Failed to fetch breach count" },
                { status: 500 }
            );
        }

        // 3) Last scan date
        const {
            data: lastScan,
            error: lastScanError,
        } = await supabase
            .from("sweep_events")
            .select("created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);

        if (lastScanError) {
            console.error("Error fetching last scan:", lastScanError);
            return NextResponse.json(
                { error: "Failed to fetch last scan date" },
                { status: 500 }
            );
        }

        const lastScanDate =
            lastScan && lastScan.length > 0 ? lastScan[0].created_at : null;

        // 4) Pending deletion requests (status in sent/received/needs_verification/in_progress)
        const {
            count: pendingRequestsCount,
            error: pendingRequestsError,
        } = await supabase
            .from("deletion_requests")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .in("status", [
                "sent",
                "received",
                "needs_verification",
                "in_progress",
            ]);

        if (pendingRequestsError) {
            console.error("Error fetching pending requests:", pendingRequestsError);
            return NextResponse.json(
                { error: "Failed to fetch pending requests" },
                { status: 500 }
            );
        }

        // 5) Responded requests (any request where we've seen a reply)
        const {
            count: respondedRequestsCount,
            error: respondedRequestsError,
        } = await supabase
                .from("deletion_requests")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .not("last_reply_at", "is", null); // last_reply_at IS NOT NULL

        if (respondedRequestsError) {
            console.error("Error fetching replied requests:", respondedRequestsError);
            return NextResponse.json(
                { error: "Failed to fetch replied requests" },
                { status: 500 }
            );
        }

        const { data: securityScore, error: securityScoreError } = await supabase
            .from("user_security_scores")
            .select("score, last_calculated_at")
            .eq("user_id", user?.id)
            .single();

        if (securityScoreError && securityScoreError.code !== "PGRST116") {
            console.error("Error fetching score:", securityScoreError);
            return NextResponse.json(
                { error: "Failed to fetch security score" },
                { status: 500 }
            );
        }


        // 3. Convert numeric score → letter grade
        const grade =
            securityScore?.score >= 90
                ? "A"
                : securityScore?.score >= 75
                    ? "B"
                    : securityScore?.score >= 60
                        ? "C"
                        : securityScore?.score >= 40
                            ? "D"
                            : "F";

        return NextResponse.json({
            service_count: serviceCount ?? 0,
            breach_count: breachCount ?? 0,
            last_scan_date: lastScanDate,
            pending_requests: pendingRequestsCount ?? 0,
            responded_requests: respondedRequestsCount ?? 0,
            security_score: {
                score: securityScore?.score ?? "100",
                grade,
                last_calculated_at: securityScore?.last_calculated_at
            }
        });
    } catch (error) {
        console.error("Error fetching user metrics:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}