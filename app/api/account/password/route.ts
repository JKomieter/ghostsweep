import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isPasswordValid, PASSWORD_REQUIREMENTS_MESSAGE } from "@/utils/password-policy";

// Changes the signed-in user's password: from account settings, or from a password reset link
// (the recovery link signs the user in first). Runs server-side because session cookies are HttpOnly.
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { error: "Your session has expired. Request a new password reset link." },
            { status: 401 }
        );
    }

    const { password } = await request.json().catch(() => ({ password: null }));
    if (typeof password !== "string" || !isPasswordValid(password)) {
        return NextResponse.json({ error: PASSWORD_REQUIREMENTS_MESSAGE }, { status: 400 });
    }

    // Supabase Auth enforces the password policy and breached-password check again here
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
        console.error("Error updating password:", error.code ?? error.message);
        return NextResponse.json({ error: error.message || "Could not update password." }, { status: 400 });
    }

    // Terminate every other session (revokes their refresh tokens server-side),
    // so anyone who knew the old password is signed out everywhere
    const { error: signOutError } = await supabase.auth.signOut({ scope: "others" });
    if (signOutError) {
        console.error("Error signing out other sessions:", signOutError.message);
    }

    return NextResponse.json({ success: true });
}
