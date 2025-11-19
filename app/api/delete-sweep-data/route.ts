import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";


export async function POST() {
    const supabase = await createClient()
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        console.error("Error getting user:", userError);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase.functions.invoke('delete-sweep-data', {
        body: { userId: user.id },
    })

    if (error) {
        console.error("Error deleting sweep data:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
    
    return NextResponse.json({ success: true });
}