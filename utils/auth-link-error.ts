// Supabase reports a failed email link (expired, already used or malformed) by redirecting
// with error params in the query string (PKCE flow) or the URL hash (implicit flow), e.g.
// ?error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired

const LINK_ERROR_CODES = new Set(["otp_expired", "otp_disabled", "flow_state_expired", "flow_state_not_found"])

/** Returns the /link_expired URL to show for these params, or null if they carry no email-link error. */
export function linkErrorPath(params: URLSearchParams): string | null {
    const errorCode = params.get("error_code")
    const description = params.get("error_description") ?? ""

    const isLinkError =
        (errorCode !== null && LINK_ERROR_CODES.has(errorCode)) ||
        /link is invalid or has expired/i.test(description)

    if (!isLinkError) return null

    const target = new URLSearchParams()
    const type = params.get("type")
    if (type) target.set("type", type)
    return `/link_expired${target.size ? `?${target}` : ""}`
}
