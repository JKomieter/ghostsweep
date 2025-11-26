// app/api/notifications/latest/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
    const supabase = await createClient();

    // Authenticate user
    const {
        data: { user },
        error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional ?limit=20 (default 20)
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 20;

    // Fetch notifications
    const { data: notifications, error } = await supabase
        .from("user_notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }

    return NextResponse.json({ notifications });
}