import { decryptToken } from "@/utils/token_crypto";

type EncryptedGoogleTokens = {
    refresh_token_encrypted?: string | null;
    access_token_encrypted?: string | null;
};

/**
 * Revokes a user's Google OAuth grant so GhostSweep can no longer access their Gmail.
 * Revoking the refresh token revokes the whole grant, including access tokens issued from it.
 * Falls back to the access token when no refresh token is stored.
 *
 * Returns true when Google confirmed the revocation or the token was already invalid.
 * Never throws, so callers can still remove the stored tokens if Google is unreachable.
 */
export async function revokeGoogleTokens(account: EncryptedGoogleTokens): Promise<boolean> {
    const encrypted = account.refresh_token_encrypted || account.access_token_encrypted;
    if (!encrypted) return true;

    let token: string;
    try {
        token = decryptToken(encrypted);
    } catch {
        console.error("Google token revocation skipped: stored token could not be decrypted");
        return false;
    }

    try {
        const res = await fetch("https://oauth2.googleapis.com/revoke", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ token }),
        });

        // 400 invalid_token means the grant was already revoked or expired
        if (res.ok || res.status === 400) return true;

        console.error("Google token revocation failed with status", res.status);
        return false;
    } catch {
        console.error("Google token revocation request failed");
        return false;
    }
}
