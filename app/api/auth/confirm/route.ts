import { type EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    const next = searchParams.get("next") ?? "/";
    const redirectTo = request.nextUrl.clone();
    redirectTo.pathname = next;

    // Tell the user exactly what went wrong instead of a generic error page
    const linkExpired = request.nextUrl.clone();
    linkExpired.pathname = "/link_expired";
    linkExpired.search = "";
    if (type) linkExpired.searchParams.set("type", type);

    if (!token_hash || !type) {
        linkExpired.searchParams.set("reason", "invalid");
        return NextResponse.redirect(linkExpired);
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (error) {
        // Supabase returns otp_expired for both expired and already-used links
        console.error("verifyOtp error:", error.code ?? error.message);
        if (error.code !== "otp_expired") linkExpired.searchParams.set("reason", "invalid");
        return NextResponse.redirect(linkExpired);
    }

    return NextResponse.redirect(redirectTo);
}
