/* eslint-disable @typescript-eslint/no-explicit-any */
import { refreshAccessToken, tokenStillValid } from "@/utils/refresh_access_token";
import sendEmail from "@/utils/send_email";
import { createClient } from "@/utils/supabase/server";
import { decryptToken } from "@/utils/token_crypto";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_FOLLOWUP_STATUSES = ["sent", "received", "needs_verification", "in_progress"] as const;
const TERMINAL_STATUSES = ["completed", "failed", "expired"] as const;

const MAX_FOLLOWUPS = 3;

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const deletion_request_id = body?.deletion_request_id as string | undefined;
    const providedBody = body?.body as string | undefined;

    if (!deletion_request_id) {
        return NextResponse.json({ error: "Missing field: deletion_request_id" }, { status: 400 });
    }

    // 👇 NEW: the dialog lets user edit, so the API must accept a body
    if (!providedBody || typeof providedBody !== "string" || providedBody.trim().length < 10) {
        return NextResponse.json(
            { error: "Missing field: body (follow-up message)" },
            { status: 400 }
        );
    }

    // 1) Load deletion request (must belong to user)
    const { data: deletionRequest, error: drError } = await supabase
        .from("deletion_requests")
        .select(
            "id, user_id, user_service_id, deletion_method, receiver_email, template_used, status, follow_up_count, thread_id, sent_at, next_follow_up_at"
        )
        .eq("id", deletion_request_id)
        .eq("user_id", user.id)
        .maybeSingle();

    if (drError) {
        console.error("Failed to load deletion request:", drError);
        return NextResponse.json({ error: "Failed to load deletion request" }, { status: 500 });
    }

    if (!deletionRequest) {
        return NextResponse.json({ error: "Deletion request not found" }, { status: 404 });
    }

    // 2) Gatekeeping rules
    if ((TERMINAL_STATUSES as readonly string[]).includes(deletionRequest.status)) {
        return NextResponse.json({ error: "This deletion request is already resolved" }, { status: 400 });
    }

    if (!(ALLOWED_FOLLOWUP_STATUSES as readonly string[]).includes(deletionRequest.status)) {
        return NextResponse.json({ error: "You can’t follow up in the current request state" }, { status: 400 });
    }

    if ((deletionRequest.follow_up_count ?? 0) >= MAX_FOLLOWUPS) {
        return NextResponse.json({ error: "Maximum number of follow-ups reached" }, { status: 400 });
    }

    if (deletionRequest.deletion_method !== "email") {
        return NextResponse.json({ error: "Follow-ups are only available for email-based requests" }, { status: 400 });
    }

    if (!deletionRequest.receiver_email) {
        return NextResponse.json({ error: "Missing receiver email for this request" }, { status: 400 });
    }

    // If you rely on threading, require it
    if (!deletionRequest.thread_id) {
        return NextResponse.json({ error: "This request has no email thread to follow up on" }, { status: 400 });
    }

    // Ensure original send happened (prevents “follow up before send”)
    if (!deletionRequest.sent_at) {
        return NextResponse.json({ error: "Send the initial deletion request before following up" }, { status: 400 });
    }

    // 3) Load Gmail connection
    const { data: gmailAccount, error: gaError } = await supabase
        .from("gmail_accounts")
        .select("user_id, gmail_address, access_token_encrypted, refresh_token_encrypted, token_expires_at")
        .eq("user_id", user.id)
        .maybeSingle();

    if (gaError) {
        console.error("Failed to load gmail account:", gaError);
        return NextResponse.json({ error: "Failed to load Gmail connection" }, { status: 500 });
    }

    if (!gmailAccount) {
        return NextResponse.json({ error: "Reconnect Gmail to send follow-ups" }, { status: 400 });
    }

    // 4) Load playbook (still useful to validate that service supports email + has deletion_email)
    const { data: userService, error: usErr } = await supabase
        .from("user_services")
        .select("id, service_id, service:services(id, name, domain)")
        .eq("id", deletionRequest.user_service_id)
        .eq("user_id", user.id)
        .maybeSingle();

    if (usErr) {
        console.error("Failed to load user_service:", usErr);
        return NextResponse.json({ error: "Failed to load service" }, { status: 500 });
    }

    if (!userService?.service_id) {
        return NextResponse.json({ error: "Service not found for this request" }, { status: 400 });
    }

    const { data: playbook, error: pbErr } = await supabase
        .from("service_deletion_playbooks")
        .select("service_id, deletion_method, deletion_email")
        .eq("service_id", userService.service_id)
        .maybeSingle();

    if (pbErr) {
        console.error("Failed to load playbook:", pbErr);
        return NextResponse.json({ error: "Failed to load deletion playbook" }, { status: 500 });
    }

    if (!playbook || playbook.deletion_method !== "email" || !playbook.deletion_email) {
        return NextResponse.json(
            { error: "This service does not support email follow-ups yet" },
            { status: 400 }
        );
    }

    // 5) Decrypt tokens + refresh if needed
    let accessToken: string;
    let refreshToken: string;

    try {
        accessToken = decryptToken(gmailAccount.access_token_encrypted);
        refreshToken = decryptToken(gmailAccount.refresh_token_encrypted);
    } catch (e) {
        console.error("Token decrypt failed:", e);
        return NextResponse.json({ error: "Reconnect Gmail to continue" }, { status: 400 });
    }

    if (!tokenStillValid(gmailAccount.token_expires_at)) {
        try {
            const refreshed = await refreshAccessToken(refreshToken);
            accessToken = refreshed.access_token;
            // Optional: persist refreshed token/expires here if you have an encrypt helper.
        } catch (e) {
            console.error("Token refresh failed:", e);
            return NextResponse.json({ error: "Reconnect Gmail to continue" }, { status: 400 });
        }
    }

    // 6) Build follow-up email (NOW uses the edited body from the dialog)
    const serviceName =
        Array.isArray((userService as any).service) && (userService as any).service?.length
            ? (userService as any).service[0]?.name
            : ((userService as any).service as { name?: string } | undefined)?.name || "the service";

    const followUpNumber = (deletionRequest.follow_up_count ?? 0) + 1;

    const subject = `Follow-up: Data deletion request (${serviceName})`;

    const followUpBody = providedBody.trim();

    // 7) Send the follow-up
    try {
        await sendEmail({
            accessToken,
            from: gmailAccount.gmail_address,
            to: playbook.deletion_email,
            subject,
            body: followUpBody,
            threadId: deletionRequest.thread_id,
        });
    } catch (e: any) {
        console.error("sendEmail failed:", e);
        return NextResponse.json({ error: "Failed to send follow-up email" }, { status: 500 });
    }

    // 8) Update deletion request
    const now = new Date().toISOString();

    const { error: updErr } = await supabase
        .from("deletion_requests")
        .update({
            follow_up_count: followUpNumber,
            status: "sent",
            updated_at: now,
            next_follow_up_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // e.g., 7 days later
        })
        .eq("id", deletionRequest.id)
        .eq("user_id", user.id);

    if (updErr) {
        console.error("Failed to update deletion request after follow-up:", updErr);
        return NextResponse.json(
            { ok: true, warning: "Follow-up sent, but status update failed" },
            { status: 200 }
        );
    }

    return NextResponse.json(
        {
            ok: true,
            deletion_request_id: deletionRequest.id,
            follow_up_count: followUpNumber,
            status: "sent",
        },
        { status: 200 }
    );
}