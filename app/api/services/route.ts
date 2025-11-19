import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";


export async function GET() {
    const supabase = await createClient();
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase.from("services")
        .select("*")

    if (error) {
        console.error("Error getting services:", error);
        return NextResponse.json(
            { error: "Could not get services" },
            { status: 500 }
        );
    }

    return NextResponse.json({
        services: data || []
    })
}