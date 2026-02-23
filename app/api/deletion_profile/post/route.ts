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

        const body = await req.json();
        const { full_name, country } = body;

        if (!full_name || typeof full_name !== 'string' || full_name.trim().length === 0 || full_name.length > 200) {
            return NextResponse.json({ error: 'full_name must be a non-empty string up to 200 characters' }, { status: 400 });
        }
        if (!country || typeof country !== 'string' || country.length > 100) {
            return NextResponse.json({ error: 'country must be a non-empty string up to 100 characters' }, { status: 400 });
        }

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