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

        // get number of user services
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
                { status: 500 },
            );
        }

        // get number of user breaches
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
                { status: 500 },
            );
        }

        // get the last scan date for the user
        const {
            data: lastScan,
            error: lastScanError,
        } = await supabase
            .from("scan_events")
            .select("created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);

        if (lastScanError) {
            console.error("Error fetching last scan:", lastScanError);
            return NextResponse.json(
                { error: "Failed to fetch last scan date" },
                { status: 500 },
            );
        }

        const lastScanDate =
            lastScan && lastScan.length > 0 ? lastScan[0].created_at : null;

        return NextResponse.json({
            service_count: serviceCount ?? 0,
            breach_count: breachCount ?? 0,
            last_scan_date: lastScanDate,
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}