import crypto from "crypto";
import type { NextResponse } from "next/server";

// CSRF protection for the Gmail/Outlook OAuth flows. The start route stores a random 256-bit
// `state` in a short-lived HttpOnly cookie; the callback must receive the identical value.

/** Constant-time comparison of the state returned by the provider with the one we stored. */
export function oauthStateMatches(cookieState: string | undefined, returnedState: string | null): boolean {
    if (!cookieState || !returnedState) return false;
    const a = Buffer.from(cookieState);
    const b = Buffer.from(returnedState);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Make the state single-use: clear it on every callback response, success or failure. */
export function clearOAuthStateCookie(res: NextResponse, name: string): NextResponse {
    res.cookies.set(name, "", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 0,
        path: "/",
    });
    return res;
}
