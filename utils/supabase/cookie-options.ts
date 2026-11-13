// Attributes for Supabase cookies (sb-*-auth-token session, PKCE code verifier), merged over
// @supabase/ssr defaults. Only server clients exist: all auth operations (sign-in, password
// change, sign-out, getUser) run on the server, so page JavaScript never needs the session.
//
// HttpOnly: page JavaScript can't read the session cookie.
// Secure: only sent over HTTPS. Off in development so sign-in still works on http://localhost
// in browsers that refuse Secure cookies over plain HTTP (e.g. Safari).
export const supabaseCookieOptions = {
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
}
