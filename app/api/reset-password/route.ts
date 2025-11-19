import { createClient } from "@/utils/supabase/server";
import { type NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { email } = await request.json();
    if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const baseUrl = process.env.NODE_ENV === "production" ? "https://www.ghostsweep.com" : "http://localhost:3000"
    // Generate a password reset link using Supabase and email it to the user
    const { data, error } = await supabase.auth.resetPasswordForEmail(
        email,
        {
            redirectTo: `${baseUrl}/reset-password`,
        }
    );
    if (error) {
        console.error("Error sending reset email:", error)
        return NextResponse.json(
            { error: "Could not send reset email" },
            { status: 500 })
    }

    return NextResponse.json(data);
}