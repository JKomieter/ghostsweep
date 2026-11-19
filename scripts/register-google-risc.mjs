// One-time setup: registers GhostSweep's RISC receiver with Google Cross-Account Protection.
//
// Prerequisites (Google Cloud project that owns the "Sign in with Google" OAuth client):
//   1. Enable the "RISC API".
//   2. Create a service account with the "RISC Configuration Admin" role and download a JSON key.
//
// Usage:
//   node scripts/register-google-risc.mjs <key.json> [receiver-url]   register + send a test event
//   node scripts/register-google-risc.mjs <key.json> --status         show current configuration
//
// Delete the key file afterwards (or keep it in a secrets manager); it is not needed at runtime.
import { readFile } from "node:fs/promises";
import { SignJWT, importPKCS8 } from "jose";

const API = "https://risc.googleapis.com/v1beta";
const AUD = "https://risc.googleapis.com/google.identity.risc.v1beta.RiscManagementService";
const EVENT = "https://schemas.openid.net/secevent";
const EVENTS_REQUESTED = [
    `${EVENT}/risc/event-type/sessions-revoked`,
    `${EVENT}/oauth/event-type/tokens-revoked`,
    `${EVENT}/risc/event-type/account-disabled`,
    `${EVENT}/risc/event-type/account-enabled`,
    `${EVENT}/risc/event-type/account-credential-change-required`,
    `${EVENT}/risc/event-type/verification`,
];

const [keyPath, arg = "https://ghostsweep.com/api/webhooks/google-risc"] = process.argv.slice(2);
if (!keyPath) {
    console.error("Usage: node scripts/register-google-risc.mjs <key.json> [receiver-url | --status]");
    process.exit(1);
}

const key = JSON.parse(await readFile(keyPath, "utf8"));
const now = Math.floor(Date.now() / 1000);
const authToken = await new SignJWT({})
    .setProtectedHeader({ alg: "RS256", kid: key.private_key_id })
    .setIssuer(key.client_email)
    .setSubject(key.client_email)
    .setAudience(AUD)
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(await importPKCS8(key.private_key, "RS256"));

async function call(method, path, body) {
    const res = await fetch(`${API}/${path}`, {
        method,
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    console.log(`${method} ${path} -> ${res.status}${text ? `\n${text}` : ""}`);
    if (!res.ok) process.exit(1);
}

if (arg === "--status") {
    await call("GET", "stream");
    await call("GET", "stream/status");
} else {
    await call("POST", "stream:update", {
        delivery: { delivery_method: `${EVENT}/risc/delivery-method/push`, url: arg },
        events_requested: EVENTS_REQUESTED,
    });
    await call("POST", "stream/status:update", { status: "enabled" });
    // Google sends a verification event to the receiver; check the Vercel logs for "RISC: verification"
    await call("POST", "stream:verify", { state: `ghostsweep-${new Date().toISOString()}` });
}
