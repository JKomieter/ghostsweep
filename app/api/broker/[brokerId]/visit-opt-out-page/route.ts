import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ brokerId: string }> }
) {
    const supabase = await createClient();

    // 1) Auth
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    const brokerId = (await params).brokerId;

    // Create or update opt-out request
    const { data: optOutRequest, error } = await supabase
        .from("opt_out_requests")
        .upsert(
            {
                user_id: userId,
                broker_id: brokerId,
                status: "in_progress",
                method: "web_form",
                notes: "User visited opt-out page",
                expires_at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                onConflict: "user_id,broker_id",
                ignoreDuplicates: false,
            }
        )
        .select()
        .single();

    if (error) {
        console.error("Failed to track visit:", error);
    }

    return Response.json({ success: true, request: optOutRequest });
}