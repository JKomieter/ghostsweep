import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"


export async function GET() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const {data, error} = await supabase.from("deletion_profiles")
            .select("full_name, country")
            .eq("user_id", user.id)
            .single()

        if (error && error.code ===  "PGRST116" || !data) {
            return NextResponse.json(
                {
                    message: "You have no deletion profile"
                },
                { status: 200 }
            );
        }

        return NextResponse.json(
            {
                full_name: data.full_name,
                country: data.country
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error creating deletion template:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}