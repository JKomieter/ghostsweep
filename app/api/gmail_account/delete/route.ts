import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function DELETE() {
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete any gmail_accounts rows for this user
    const { error } = await supabase
        .from("gmail_accounts")
        .delete()
        .eq("user_id", user.id);

    if (error) {
        console.error("Error deleting gmail account:", error);
        return NextResponse.json(
            { error: "Could not disconnect Gmail account" },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}