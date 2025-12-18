// app/api/auth/confirm/route.ts
import { type EmailOtpType } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get("token_hash")
    const type = searchParams.get("type") as EmailOtpType | null

    // Decide where to send the user based on the link type
    const targetPath =
        type === "recovery"
            ? "/reset_password" // password reset flow
            : "/dashboard"      // signup verification / email change / default

    const redirectTo = request.nextUrl.clone()
    redirectTo.pathname = targetPath
    redirectTo.searchParams.delete("token_hash")
    redirectTo.searchParams.delete("type")
    redirectTo.searchParams.delete("next") // just in case

    if (token_hash && type) {
        const supabase = await createClient()

        const { error } = await supabase.auth.verifyOtp({
            type,      // "signup" | "recovery" | "email_change"
            token_hash,
        })

        if (!error) {
            // ✅ Session is now created, send user to the right place
            return NextResponse.redirect(redirectTo)
        }

        console.error("verifyOtp error:", error)
    }

    // Fallback: error page
    redirectTo.pathname = "/error"
    redirectTo.searchParams.delete("next")
    return NextResponse.redirect(redirectTo)
}