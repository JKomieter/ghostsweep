import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;

    // Validate required parameters
    if (!token_hash || !type) {
        console.error("Missing token_hash or type in the request");
        const errorRedirect = request.nextUrl.clone();
        errorRedirect.pathname = "/error";
        return NextResponse.redirect(errorRedirect);
    }

    // Validate type
    const validTypes: EmailOtpType[] = ["signup", "recovery", "email_change"];
    if (!validTypes.includes(type)) {
        console.error("Invalid type parameter:", type);
        const errorRedirect = request.nextUrl.clone();
        errorRedirect.pathname = "/error";
        return NextResponse.redirect(errorRedirect);
    }

    // Decide where to send the user based on the link type
    const targetPath =
        type === "recovery"
            ? "/reset_password" // password reset flow
            : "/dashboard"; // signup verification / email change / default

    const redirectTo = request.nextUrl.clone();
    redirectTo.pathname = targetPath;
    redirectTo.searchParams.delete("token_hash");
    redirectTo.searchParams.delete("type");

    // Preserve the "next" parameter if it exists
    const next = searchParams.get("next");
    if (next) {
        redirectTo.searchParams.set("next", next);
    }

    // Verify OTP
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
        type, // "signup" | "recovery" | "email_change"
        token_hash,
    });

    if (error) {
        console.error("verifyOtp error:", error);
        redirectTo.pathname = "/error";
        redirectTo.searchParams.set("error", "otp_verification_failed");
        return NextResponse.redirect(redirectTo);
    }

    // ✅ Session is now created, send user to the right place
    return NextResponse.redirect(redirectTo);
}