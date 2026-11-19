import { NextRequest, NextResponse } from "next/server";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { createAdminClient } from "@/utils/supabase/admin";

// Google Cross-Account Protection (RISC) receiver.
// Google pushes a signed Security Event Token here when a user's Google account has its password
// changed, its sessions revoked, or is disabled for compromise. For those events we end every
// GhostSweep session (and refresh token) of the linked user, so federated sign-ins are invalidated
// the same way a GhostSweep password change invalidates them.
// Discovery: https://accounts.google.com/.well-known/risc-configuration

const RISC_ISSUER = "https://accounts.google.com";
const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

const EVENT = "https://schemas.openid.net/secevent";
const REVOKE_SESSIONS_EVENTS = new Set([
    `${EVENT}/risc/event-type/sessions-revoked`,
    `${EVENT}/oauth/event-type/tokens-revoked`,
    `${EVENT}/risc/event-type/account-disabled`,
    `${EVENT}/risc/event-type/account-credential-change-required`,
]);
const VERIFICATION_EVENT = `${EVENT}/risc/event-type/verification`;

type RiscEvent = { subject?: { subject_type?: string; iss?: string; sub?: string }; reason?: string; state?: string };
type RiscPayload = JWTPayload & { events?: Record<string, RiscEvent> };

// OAuth client IDs in our Google Cloud project: the Supabase "Sign in with Google" client and the
// Gmail-connection client. Google sets "aud" to the client the user signed in with.
function audiences(): string[] {
    const ids = (process.env.GOOGLE_RISC_AUDIENCES ?? process.env.GOOGLE_CLIENT_ID ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    return ids;
}

export async function POST(req: NextRequest) {
    const aud = audiences();
    if (aud.length === 0) {
        console.error("RISC: no audiences configured (GOOGLE_RISC_AUDIENCES)");
        return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    const token = (await req.text()).trim();
    let payload: RiscPayload;
    try {
        // Signature, issuer and audience are all checked; RISC tokens carry no "exp"
        ({ payload } = await jwtVerify<RiscPayload>(token, GOOGLE_JWKS, {
            issuer: RISC_ISSUER,
            audience: aud,
            algorithms: ["RS256"],
        }));
    } catch (error) {
        console.warn("RISC: rejected token:", error instanceof Error ? error.message : "invalid");
        return NextResponse.json({ error: "Invalid security event token" }, { status: 400 });
    }

    const supabase = createAdminClient();
    for (const [type, event] of Object.entries(payload.events ?? {})) {
        if (type === VERIFICATION_EVENT) {
            console.log("RISC: verification event received", event.state ?? "");
            continue;
        }
        if (!REVOKE_SESSIONS_EVENTS.has(type)) continue;

        const sub = event.subject?.sub;
        if (!sub) continue;

        const { data, error } = await supabase.rpc("revoke_sessions_for_google_sub", { google_sub: sub });
        if (error) {
            // A 5xx makes Google retry delivery
            console.error("RISC: session revocation failed:", error.message);
            return NextResponse.json({ error: "Revocation failed" }, { status: 500 });
        }
        console.warn(`RISC: ${type.split("/").pop()} -> revoked ${data ?? 0} session(s)`, { jti: payload.jti });
    }

    return new NextResponse(null, { status: 202 });
}
