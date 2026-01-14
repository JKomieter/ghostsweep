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

    // Fetch broker details
    const { data: broker, error } = await supabase
        .from("data_brokers")
        .select("*")
        .eq("id", brokerId)
        .single();

    if (error || !broker) {
        return Response.json({ error: "Broker not found" }, { status: 404 });
    }

    return Response.json({ broker });
}
