// Server-only helpers for promotional email: signed unsubscribe links and the opt-out check.
// Every email with an upgrade pitch or referral offer must go through here, so a
// user who opted out (in Settings, via a link, or on the public unsubscribe page) never gets one.
import { createHmac, timingSafeEqual } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SITE_URL } from "@/lib/share";

const SECRET = process.env.EMAIL_UNSUBSCRIBE_SECRET;

function sign(userId: string): string {
    return createHmac("sha256", SECRET!).update(`unsubscribe:${userId}`).digest("base64url");
}

/** Token for a user's unsubscribe link, or null if the signing secret isn't configured. */
export function unsubscribeToken(userId: string): string | null {
    if (!SECRET) return null;
    return `${userId}.${sign(userId)}`;
}

/** The user ID a valid token belongs to, or null for a missing, tampered or forged token. */
export function verifyUnsubscribeToken(token: string | null | undefined): string | null {
    if (!SECRET || !token) return null;
    const dot = token.lastIndexOf(".");
    if (dot <= 0) return null;
    const userId = token.slice(0, dot);
    const given = Buffer.from(token.slice(dot + 1));
    const expected = Buffer.from(sign(userId));
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
    return userId;
}

/**
 * Unsubscribe link plus the List-Unsubscribe headers that give Gmail and Outlook their built-in
 * one-click "Unsubscribe" button (RFC 8058). Null when the secret isn't set: callers must then
 * leave out all promotional content rather than send it without a working opt-out.
 */
export function unsubscribeLinks(userId: string): { pageUrl: string; headers: Record<string, string> } | null {
    const token = unsubscribeToken(userId);
    if (!token) return null;
    const t = encodeURIComponent(token);
    return {
        pageUrl: `${SITE_URL}/home/unsubscribe?token=${t}`,
        headers: {
            "List-Unsubscribe": `<${SITE_URL}/api/unsubscribe/one-click?token=${t}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
    };
}

/** Records the opt-out. Uses the service-role client, as the link works without signing in. */
export async function optOutOfMarketing(admin: SupabaseClient, userId: string) {
    const now = new Date().toISOString();
    return admin
        .from("email_preferences")
        .upsert({ user_id: userId, marketing_opt_out_at: now, updated_at: now }, { onConflict: "user_id" });
}

/**
 * User IDs (from the given list) that must not get promotional email: opted out in Settings or
 * through a link, or their address is on the public unsubscribe list. Throws on a lookup error,
 * so a database problem means no promotional email rather than email to people who opted out.
 */
export async function optedOutUserIds(
    admin: SupabaseClient,
    users: { userId: string; email: string | null }[]
): Promise<Set<string>> {
    const out = new Set<string>();
    if (users.length === 0) return out;

    const ids = users.map((u) => u.userId);
    const emails = Array.from(
        new Set(users.map((u) => u.email?.trim().toLowerCase()).filter((e): e is string => Boolean(e)))
    );

    const [prefs, listed] = await Promise.all([
        admin.from("email_preferences").select("user_id").in("user_id", ids).not("marketing_opt_out_at", "is", null),
        emails.length
            ? admin.from("non_subscribers").select("email").in("email", emails)
            : Promise.resolve({ data: [] as { email: string }[], error: null }),
    ]);
    if (prefs.error) throw new Error(`email_preferences lookup failed: ${prefs.error.message}`);
    if (listed.error) throw new Error(`non_subscribers lookup failed: ${listed.error.message}`);

    for (const row of prefs.data ?? []) out.add(row.user_id as string);
    const listedEmails = new Set((listed.data ?? []).map((r) => String(r.email).toLowerCase()));
    for (const u of users) {
        if (u.email && listedEmails.has(u.email.trim().toLowerCase())) out.add(u.userId);
    }
    return out;
}
