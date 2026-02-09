import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 30; // Revalidate every 30 seconds for ISR

interface MarketingFeedItem {
    id: string;
    type: string;
    service_name: string;
    amount: number;
    location_text: string;
    created_at: string;
}

export async function GET() {
    try {
        const supabase = await createClient();

        // Fetch recent items from marketing_live_feed (public table, no auth needed)
        const { data: feedItems, error: feedError } = await supabase
            .from("marketing_live_feed")
            .select("id, type, service_name, amount, location_text, created_at")
            .order("created_at", { ascending: false })
            .limit(20);

        if (feedError) {
            console.error("Error fetching marketing feed:", feedError);
            return NextResponse.json(
                { error: "Failed to fetch feed", code: "FEED_FETCH_ERROR" },
                { status: 500 }
            );
        }

        // Call the RPC function to get daily scan count
        const { data: scanCount, error: scanError } = await supabase.rpc(
            "get_daily_scan_count"
        );

        if (scanError) {
            console.error("Error fetching scan count:", scanError);
            // Don't fail the whole request, just use a fallback
        }

        // Calculate weekly total from the feed items (or approximate)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { data: weeklyData, error: weeklyError } = await supabase
            .from("marketing_live_feed")
            .select("amount")
            .gte("created_at", weekAgo.toISOString());

        let weeklyTotal = 0;
        if (!weeklyError && weeklyData) {
            weeklyTotal = weeklyData.reduce(
                (sum, item) => sum + (Number(item.amount) || 0),
                0
            );
        }

        // Format the feed items for the frontend
        const formattedFeed = (feedItems as MarketingFeedItem[] || []).map((item) => ({
            id: item.id,
            type: item.type,
            serviceName: item.service_name,
            amount: Number(item.amount),
            location: item.location_text || "Remote",
            createdAt: item.created_at,
        }));

        return NextResponse.json({
            feed: formattedFeed,
            dailyScanCount: scanCount || 0,
            weeklyTotal: Math.round(weeklyTotal * 100) / 100,
        });
    } catch (error) {
        console.error("Marketing feed API error:", error);
        return NextResponse.json(
            { error: "Internal server error", code: "INTERNAL_ERROR" },
            { status: 500 }
        );
    }
}
