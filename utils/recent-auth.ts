import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { REAUTH_REQUIRED_CODE } from "./reauth-code";

export { REAUTH_REQUIRED_CODE };

// Sensitive account changes (password change, account deletion) need the user to have actually
// signed in recently, not just to hold a long-lived session that has been silently refreshed.
// Matches Supabase Auth's "Secure password change" window.
export const RECENT_AUTH_MAX_AGE_SECONDS = 60;


/**
 * True if the user authenticated (password, Google sign-in, email/recovery link) within the window.
 * Uses the signed `amr` claim of the verified session JWT: each entry records when an
 * authentication method was used, and those timestamps don't change when the token is refreshed.
 */
export async function hasRecentAuthentication(
    supabase: SupabaseClient,
    maxAgeSeconds = RECENT_AUTH_MAX_AGE_SECONDS
): Promise<boolean> {
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) return false;

    const amr = data.claims.amr;
    const timestamps = Array.isArray(amr)
        ? amr
              .map((entry) => (typeof entry === "object" && entry !== null ? Number(entry.timestamp) : NaN))
              .filter(Number.isFinite)
        : [];

    // Fail closed: no authentication time means we can't prove a recent sign-in
    if (timestamps.length === 0) return false;

    const lastAuthenticatedAt = Math.max(...timestamps);
    return Date.now() / 1000 - lastAuthenticatedAt <= maxAgeSeconds;
}

export function reauthRequiredResponse() {
    return NextResponse.json(
        {
            error: "For your security, please sign in again to make this change.",
            code: REAUTH_REQUIRED_CODE,
        },
        { status: 403 }
    );
}
