import { createHash, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { SITE_URL } from "@/lib/share";
import { createAdminClient } from "@/utils/supabase/admin";
import { resolvePlan } from "@/lib/entitlements";
import { RECOVERABLE_VALUE_TYPES, claimableCents } from "@/lib/found-values";
import { CHECKOUT_REASSURANCE, FREE_ACCOUNT_PREVIEW, PAID_PLANS, isPaidPlan } from "@/lib/plans";

// Post-scan email. Called by a Supabase Database Webhook on sweep_events UPDATE, with the shared
// x-ghostsweep-secret header. Sends once, when a sweep moves to "completed".

const resend = new Resend(process.env.RESEND_API_KEY);
// Must be an address on a domain verified in Resend
const FROM = process.env.SCAN_EMAIL_FROM ?? "GhostSweep <alerts@ghostsweep.com>";

type SweepRow = {
    id: string;
    user_id: string | null;
    email: string | null; // the inbox that was scanned (the user's own)
    status: string | null;
    services_found: number | null;
    breaches_found: number | null;
};

type WebhookPayload = { type: string; table: string; record: SweepRow | null; old_record: SweepRow | null };

// Constant-time check of the shared secret. Hashing first gives equal-length inputs, so neither
// the content nor the length of the expected secret leaks through timing. Missing or wrong
// secrets get the same 401.
function secretMatches(received: string | null, expected: string | undefined): boolean {
    if (!received || !expected) return false;
    const a = createHash("sha256").update(received).digest();
    const b = createHash("sha256").update(expected).digest();
    return timingSafeEqual(a, b);
}

function escapeHtml(s: string) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

/**
 * The user's plan and the money their scan found, for personalising the email. Any failure falls
 * back to the plain email (treated as a paid user with nothing found), so the send never breaks.
 */
async function lookupUpgradeContext(userId: string | null): Promise<{ isFree: boolean; claimable: number }> {
    if (!userId) return { isFree: false, claimable: 0 };
    try {
        const supabase = createAdminClient();
        const [{ data: sub, error: subError }, { data: values, error: valuesError }] = await Promise.all([
            supabase
                .from("user_subscriptions")
                .select("current_plan, renews_at, scan_credits_remaining")
                .eq("user_id", userId)
                .maybeSingle(),
            supabase
                .from("found_values")
                .select("amount, status, risk_level")
                .eq("user_id", userId)
                .in("type", [...RECOVERABLE_VALUE_TYPES]),
        ]);
        if (subError || valuesError) {
            console.error("Post-scan email context lookup failed:", subError?.message ?? valuesError?.message);
            return { isFree: false, claimable: 0 };
        }
        // Amounts are stored in cents
        return { isFree: !isPaidPlan(resolvePlan(sub)), claimable: Math.round(claimableCents(values ?? []) / 100) };
    } catch (err) {
        console.error("Post-scan email context lookup failed:", err);
        return { isFree: false, claimable: 0 };
    }
}

export async function POST(req: NextRequest) {
    if (!secretMatches(req.headers.get("x-ghostsweep-secret"), process.env.FUNCTION_SECRET)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await req.json().catch(() => null)) as WebhookPayload | null;
    const sweep = payload?.record;
    const justCompleted = payload?.type === "UPDATE" && sweep?.status === "completed" && payload.old_record?.status !== "completed";
    if (!sweep || !justCompleted || !sweep.email) return NextResponse.json({ skipped: true });

    const found = sweep.services_found ?? 0;
    const breaches = sweep.breaches_found ?? 0;
    const dashboard = `${SITE_URL}/dashboard`;
    const share = `${SITE_URL}/dashboard?share=1`;
    const settings = `${SITE_URL}/dashboard/settings`;
    const billing = `${SITE_URL}/dashboard/billing`;

    const { isFree, claimable } = await lookupUpgradeContext(sweep.user_id);
    const money = claimable > 0 ? `$${claimable.toLocaleString("en-US")}` : "";

    const headline = found > 0
        ? `Your sweep found ${found.toLocaleString("en-US")} accounts and services with your data`
        : "Your sweep is done";
    // Money found is the strongest hook, so it leads the subject line when there is any
    const subject = money
        ? `Your sweep found ${money} you can claim${found > 0 ? ` and ${found.toLocaleString("en-US")} accounts with your data` : ""}`
        : headline;
    const breachLine = breaches > 0 ? `${breaches.toLocaleString("en-US")} of them showed up in data breaches.` : "";
    const moneyLine = money ? `It also found ${money} in gift cards, rewards and refunds you can still claim.` : "";

    // Free users only see a preview, so spell out what unlocking gets them
    const showUpgrade = isFree && (found > FREE_ACCOUNT_PREVIEW || claimable > 0);
    const upgradeLead = found > FREE_ACCOUNT_PREVIEW
        ? `Your free scan shows the ${FREE_ACCOUNT_PREVIEW} riskiest. Unlock all ${found.toLocaleString("en-US")}`
        : "Unlock everything your scan found";
    const upgradeLine = `${upgradeLead}${money ? `, every gift card code (${money} in total)` : ""} and the steps to delete each account.`;
    const buster = PAID_PLANS.buster;
    const upgradeOffer = `${buster.name}: ${buster.price} one-time, no subscription.`;

    const text = [
        `${headline}.${breachLine ? ` ${breachLine}` : ""}${moneyLine ? ` ${moneyLine}` : ""}`,
        `See what to delete first: ${dashboard}`,
        ...(showUpgrade ? ["", upgradeLine, `${upgradeOffer} ${billing}`, CHECKOUT_REASSURANCE] : []),
        "",
        "Know someone with an inbox full of old sign-ups? Share your ghost-account count. Friends get 50% off and you get a free month:",
        share,
        "",
        `Email settings: ${settings}`,
    ].join("\n");

    const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f6f7f9;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#111">
<table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:24px"><tr><td>
<p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#059669;font-weight:600">Sweep complete</p>
<p style="margin:0 0 8px;font-size:20px;font-weight:600;line-height:1.3">${escapeHtml(headline)}</p>
${breachLine ? `<p style="margin:0 0 8px;font-size:15px;color:#b91c1c">${escapeHtml(breachLine)}</p>` : ""}
${moneyLine ? `<p style="margin:0 0 8px;font-size:15px;color:#047857;font-weight:600">${escapeHtml(moneyLine)}</p>` : ""}
<p style="margin:16px 0 0"><a href="${dashboard}" style="display:inline-block;background:#10b981;color:#000;text-decoration:none;font-weight:600;font-size:14px;padding:10px 18px;border-radius:999px">See your results</a></p>
${showUpgrade ? `<div style="margin-top:24px;padding:16px;border-radius:10px;border:1px solid #e5e7eb">
<p style="margin:0 0 6px;font-size:15px;font-weight:600">${escapeHtml(upgradeLine)}</p>
<p style="margin:0 0 10px;font-size:14px;color:#374151">${escapeHtml(upgradeOffer)}</p>
<a href="${billing}" style="font-size:14px;font-weight:600;color:#047857">Unlock everything →</a>
<p style="margin:10px 0 0;font-size:12px;color:#6b7280">${escapeHtml(CHECKOUT_REASSURANCE)}</p>
</div>` : ""}
<div style="margin-top:24px;padding:16px;border-radius:10px;background:#ecfdf5">
<p style="margin:0 0 6px;font-size:15px;font-weight:600">Share your ghost-account count 👻</p>
<p style="margin:0 0 10px;font-size:14px;color:#374151">Friends get 50% off. You get a free month for each one who upgrades.</p>
<a href="${share}" style="font-size:14px;font-weight:600;color:#047857">Get my share card →</a>
</div>
<p style="margin:24px 0 0;font-size:12px;color:#6b7280">You're getting this because you ran a GhostSweep scan. <a href="${settings}" style="color:#6b7280">Email settings</a></p>
</td></tr></table></body></html>`;

    const { error } = await resend.emails.send({ from: FROM, to: sweep.email, subject, text, html });
    if (error) {
        console.error("Post-scan email failed:", sweep.id, error);
        return NextResponse.json({ error: "Send failed" }, { status: 502 });
    }
    return NextResponse.json({ sent: true });
}
