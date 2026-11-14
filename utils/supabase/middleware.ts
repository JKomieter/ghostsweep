import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { supabaseCookieOptions } from './cookie-options'

const publicRoutes = [
    "/login",
    "/forgot_password",
    "/api/auth/confirm",
    "/api/auth/callback",
    "/api/auth/google", // starts Google sign-in
    "/api/auth/user", // returns 401 itself when signed out
    "/api/account/password", // returns 401 itself when signed out
    "/api/signout", // must run even with an expired session, to clear cookies and browser storage
    "/help",
    "/home",
    "/reset_password",
    "/link_expired",
    "/api/reset_password",
    "/api/webhooks",
    "/api/waitlist",
    "/api/unsubscribe",
    "/api/breach_check",
    "/api/teaser-scan",
    "/api/scan/teaser",
    "/api/marketing/stats",
    "/api/cron", // authenticated by CRON_SECRET, not a user session
    "/share", // public results card that friends open
    "/api/og",
    "/api/logo", // company logos, also shown on the public homepage scan
    "/sitemap.xml",
]

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookieOptions: supabaseCookieOptions,
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    // Pass the options through, or refreshed session cookies lose Secure/SameSite/Max-Age
                    cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: Don't remove getClaims()
    const { data } = await supabase.auth.getClaims()

    const user = data?.claims

    if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/forgot_password")) {
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return NextResponse.redirect(url)
    }

    if (publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
        return supabaseResponse
    }

    if (
        !user 
    ) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }


    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse
}