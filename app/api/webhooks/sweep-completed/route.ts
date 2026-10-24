import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { SITE_URL } from "@/lib/share";

// Post-scan email. Called by a Supabase Database Webhook on sweep_events UPDATE, with the shared
// x-ghostsweep-secret header. Sends once, when a sweep moves to "completed".

const resend = new Resend(process.env.RESEND_API_KEY);
// Must be an address on a domain verified in Resend
const FROM = process.env.SCAN_EMAIL_FROM ?? "GhostSweep <alerts@ghostsweep.com>";

type SweepRow = {
    id: string;
    email: string | null; // the inbox that was scanned (the user's own)
    status: string | null;
    services_found: number | null;
    breaches_found: number | null;
};

type WebhookPayload = { type: string; table: string; record: SweepRow | null; old_record: SweepRow | null };

function escapeHtml(s: string) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export async function POST(req: NextRequest) {
    if (!process.env.FUNCTION_SECRET || req.headers.get("x-ghostsweep-secret") !== process.env.FUNCTION_SECRET) {
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

    const headline = found > 0
        ? `Your sweep found ${found.toLocaleString("en-US")} accounts and services with your data`
        : "Your sweep is done";
    const breachLine = breaches > 0 ? `${breaches.toLocaleString("en-US")} of them showed up in data breaches.` : "";

    const text = [
        `${headline}.${breachLine ? ` ${breachLine}` : ""}`,
        `See what to delete first: ${dashboard}`,
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
${breachLine ? `<p style="margin:0 0 16px;font-size:15px;color:#b91c1c">${escapeHtml(breachLine)}</p>` : ""}
<a href="${dashboard}" style="display:inline-block;background:#10b981;color:#000;text-decoration:none;font-weight:600;font-size:14px;padding:10px 18px;border-radius:999px">See your results</a>
<div style="margin-top:24px;padding:16px;border-radius:10px;background:#ecfdf5">
<p style="margin:0 0 6px;font-size:15px;font-weight:600">Share your ghost-account count 👻</p>
<p style="margin:0 0 10px;font-size:14px;color:#374151">Friends get 50% off. You get a free month for each one who upgrades.</p>
<a href="${share}" style="font-size:14px;font-weight:600;color:#047857">Get my share card →</a>
</div>
<p style="margin:24px 0 0;font-size:12px;color:#6b7280">You're getting this because you ran a GhostSweep scan. <a href="${settings}" style="color:#6b7280">Email settings</a></p>
</td></tr></table></body></html>`;

    const { error } = await resend.emails.send({ from: FROM, to: sweep.email, subject: headline, text, html });
    if (error) {
        console.error("Post-scan email failed:", sweep.id, error);
        return NextResponse.json({ error: "Send failed" }, { status: 502 });
    }
    return NextResponse.json({ sent: true });
}
