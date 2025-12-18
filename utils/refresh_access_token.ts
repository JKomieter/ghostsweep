const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";

export async function refreshAccessToken(refreshToken: string) {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        throw new Error("Missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET");
    }

    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        }),
    });

    if (!res.ok) throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`);
    return res.json(); // { access_token, expires_in, ... }
}

export function tokenStillValid(expiresAtIso: string | null) {
    if (!expiresAtIso) return false;
    const exp = new Date(expiresAtIso).getTime();
    return exp - Date.now() > 2 * 60 * 1000; // 2 min buffer
}