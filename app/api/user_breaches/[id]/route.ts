import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json(
            { error: "Breach ID is required" },
            { status: 400 }
        );
    }

    const supabase = await createClient();

    // 1) Auth
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Fetch the user_breaches row (this ties user + service + breach together)
    const {
        data: userBreach,
        error: userBreachError,
    } = await supabase
        .from("user_breaches")
        .select(`
                *,
                breach:breaches (*),
                service:services!inner (*)
        `)
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (userBreachError) {
        console.error("Error fetching user_breach:", userBreachError);
        const status = userBreachError.code === "PGRST116" ? 404 : 500;
        return NextResponse.json(
            { error: "Breach not found" },
            { status }
        );
    }

    // 6) Shape response for your BreachDetailsSheet
    return NextResponse.json(
        {
            userBreach,
        },
        { status: 200 }
    );
}