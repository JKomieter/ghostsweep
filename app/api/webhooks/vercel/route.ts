import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Secret-store alerting. A Vercel account webhook (Team Settings → Webhooks) sends
// project.env-variable.created / .updated / .deleted events here, and each one is emailed to the
// security owner straight away. Vercel never includes env var values in these payloads.
// Every change (and every decryption) is also recorded in the Vercel Activity Log.

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.SCAN_EMAIL_FROM ?? "GhostSweep <alerts@ghostsweep.com>";
const ALERT_TO = process.env.SECURITY_ALERT_EMAIL ?? "support@ghostsweep.com";

type VercelWebhook = {
    id?: string;
    type?: string;
    createdAt?: number;
    payload?: {
        team?: { id?: string };
        user?: { id?: string };
        projectId?: string;
        project?: { id?: string; name?: string };
        envVarId?: string;
    };
};

// Vercel signs the raw body with HMAC-SHA1 using the webhook's secret (x-vercel-signature)
function signatureValid(body: string, signature: string | null): boolean {
    const secret = process.env.VERCEL_WEBHOOK_SECRET;
    if (!secret || !signature) return false;
    const expected = createHmac("sha1", secret).update(body).digest();
    const received = Buffer.from(signature, "hex");
    return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function POST(req: NextRequest) {
    const body = await req.text();
    if (!signatureValid(body, req.headers.get("x-vercel-signature"))) {
        return NextResponse.json({ message: "Invalid webhook signature" }, { status: 400 });
    }

    let event: VercelWebhook;
    try {
        event = JSON.parse(body);
    } catch {
        return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const type = event.type ?? "unknown";
    const p = event.payload ?? {};
    const when = new Date(event.createdAt ?? Date.now()).toISOString();
    const lines = [
        `Event: ${type}`,
        `Time (UTC): ${when}`,
        `Project: ${p.project?.name ?? p.projectId ?? p.project?.id ?? "unknown"}`,
        `Environment variable ID: ${p.envVarId ?? "n/a"}`,
        `Changed by user ID: ${p.user?.id ?? "unknown"}`,
        `Vercel event ID: ${event.id ?? "n/a"}`,
        "",
        "If you did not make this change, rotate the affected secret and review the Vercel Activity Log.",
    ];

    console.warn(`🔐 Secret-store event: ${type}`, { project: p.projectId, envVarId: p.envVarId, user: p.user?.id });

    const { error } = await resend.emails.send({
        from: FROM,
        to: ALERT_TO,
        subject: `[GhostSweep security] Vercel ${type}`,
        text: lines.join("\n"),
    });
    if (error) {
        // A 5xx makes Vercel retry, so the alert is not silently lost
        console.error("Secret-store alert email failed:", error.name);
        return NextResponse.json({ message: "Alert delivery failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
