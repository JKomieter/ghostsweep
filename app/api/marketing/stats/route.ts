import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Totals move slowly; cache at the edge so the homepage doesn't hit the DB per visit
const CACHE_HEADER = "public, s-maxage=3600, stale-while-revalidate=86400";

export async function GET() {
    try {
        const supabase = await createClient();

        // See supabase/sql/get_public_stats.sql
        const { data, error } = await supabase.rpc("get_public_stats");

        if (error || !data) {
            console.error("Error fetching public stats:", error);
            return NextResponse.json(
                { error: "Failed to fetch stats", code: "STATS_FETCH_ERROR" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                scansCompleted: Number(data.scans_completed) || 0,
                // Stored in cents
                giftCardValue: Math.round((Number(data.gift_card_cents) || 0) / 100),
            },
            { headers: { "Cache-Control": CACHE_HEADER } }
        );
    } catch (error) {
        console.error("Public stats API error:", error);
        return NextResponse.json(
            { error: "Internal server error", code: "INTERNAL_ERROR" },
            { status: 500 }
        );
    }
}
