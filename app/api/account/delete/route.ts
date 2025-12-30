import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";


export async function POST() {
    const supabase = await createClient();
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();
    console.log("Deleting user:", user);
    if (userError) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user?.id) {
        return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const { error } = await supabase.functions.invoke("delete-user", {
        body: { userId: user.id },
        headers: {
            "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
        }
    });

    if (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Internal Server Error"},
            { status: 500 }
        );
    }

    return NextResponse.json("You've been deleted");
}