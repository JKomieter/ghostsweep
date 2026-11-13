import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Starts "Sign in with Google" on the server, so the PKCE code verifier is stored in an
// HttpOnly cookie and the session is created server-side in /api/auth/callback.
export async function GET(request: NextRequest) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${request.nextUrl.origin}/api/auth/callback`,
        },
    });

    if (error || !data.url) {
        console.error("Google sign-in failed to start:", error?.message);
        return NextResponse.redirect(new URL("/login?error=oauth", request.url));
    }

    return NextResponse.redirect(data.url);
}
