

// get the opt out requests with brokerId and userId

import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

export async function GET(
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

    const brokerId = (await params).brokerId;

    // Fetch opt-out requests for this user and broker
    const { data: optOutRequest, error } = await supabase
        .from("opt_out_requests")
        .select("*")
        .eq("broker_id", brokerId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

    if (error) {
        return Response.json({ error: "Failed to fetch opt-out requests" }, { status: 500 });
    }

    return Response.json({ optOutRequest });
}