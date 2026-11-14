// Redirect URI for the Outlook (Microsoft identity platform) OAuth flow.
// It must be on the same host the user started on, or the HttpOnly state cookie set on that host
// isn't sent to the callback. Only fixed, pre-registered URIs are ever used (each one is registered
// as an exact-match redirect URI in the Azure app registration); unknown hosts fall back to the
// canonical one, so the value can never be influenced by request headers.
const REGISTERED_ORIGINS =
    process.env.NODE_ENV === "production"
        ? ["https://www.ghostsweep.com", "https://ghostsweep.com"]
        : ["http://localhost:3000"];

const CALLBACK_PATH = "/api/microsoft/oauth/callback";

export function microsoftRedirectUri(requestOrigin: string): string {
    const origin = REGISTERED_ORIGINS.includes(requestOrigin) ? requestOrigin : REGISTERED_ORIGINS[0];
    return `${origin}${CALLBACK_PATH}`;
}
