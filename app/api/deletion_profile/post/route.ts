import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";


export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { full_name, country } = await req.json();

        await supabase.from("deletion_profiles")
            .upsert({
                full_name,
                country,
                user_id: user?.id
            }, {onConflict: "user_id"})

        return NextResponse.json(
            {
                success: "Deletion Profile created"
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