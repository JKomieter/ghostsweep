import { createClient } from "@/utils/supabase/client";
import { NextResponse } from "next/server";


export async function POST() {
    const supabase = createClient();
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase.auth.admin.deleteUser(
        user.id
    )

    if (error) {
        console.error("Error deleting user news:", error);
        return NextResponse.json(
            { error: "Internal Server Error"},
            { status: 500 }
        );
    }

    return NextResponse.json("You've been deleted");
}