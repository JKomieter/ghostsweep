/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/gmail/send_deletion_email/route.ts
import { refreshAccessToken, tokenStillValid } from "@/utils/refresh_access_token";
import sendEmail from "@/utils/send_email";
import { createClient } from "@/utils/supabase/server";
import { decryptToken } from "@/utils/token_crypto";
import { NextRequest, NextResponse } from "next/server";

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

    const user_service_id = body?.user_service_id as string | undefined;
    const receiver_email = body?.receiver_email as string | undefined;
    const subject = body?.subject as string | undefined;
    const template_used = body?.template_used as string | undefined;

    if (!user_service_id || !receiver_email || !subject || !template_used) {
        return NextResponse.json(
            { error: "Missing fields: user_service_id, receiver_email, subject, template_used" },
            { status: 400 }
        );
    }

    // Ensure this user owns that user_service_id
    const { data: owns, error: ownsErr } = await supabase
        .from("user_services")
        .select("id")
        .eq("id", user_service_id)
        .eq("user_id", user.id)
        .maybeSingle();

    if (ownsErr) return NextResponse.json({ error: "Failed to verify ownership" }, { status: 500 });
    if (!owns) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Load Gmail connection
    const { data: conn, error: connErr } = await supabase
        .from("gmail_accounts")
        .select("gmail_address, access_token_encrypted, refresh_token_encrypted, token_expires_at")
        .eq("user_id", user.id)
        .maybeSingle();

    if (connErr) return NextResponse.json({ error: "Failed to load Gmail connection" }, { status: 500 });
    if (!conn) return NextResponse.json({ error: "Gmail not connected" }, { status: 400 });


    const gmailAddress = conn.gmail_address as string;
    let accessToken =  decryptToken(conn.access_token_encrypted as string);
    const refreshToken = decryptToken(conn.refresh_token_encrypted as string);

    // Refresh token if needed; optionally persist new expires time
    if (!tokenStillValid(conn.token_expires_at as string | null)) {
        const refreshed = await refreshAccessToken(refreshToken);
        accessToken = refreshed.access_token;

        const newExpiresAt = new Date(Date.now() + Number(refreshed.expires_in) * 1000).toISOString();
        await supabase
            .from("gmail_accounts")
            .update({ token_expires_at: newExpiresAt })
            .eq("user_id", user.id);
        // (If you also store access_token_encrypted updated, do it here—but not required if you refresh often.)
    }


    // Send via Gmail
    let sent;
    try {
        sent = await sendEmail({
            accessToken,
            from: gmailAddress,
            to: receiver_email,
            subject,
            body: template_used,
        });
    } catch (error) {
        console.error("Gmail send error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: `Gmail send failed: ${errorMessage}` }, { status: 502 });
    }

    // `sent` already contains the parsed response from Gmail API
    const now = new Date().toISOString();

    // Upsert deletion request as SENT
    const { error: upsertErr } = await supabase
        .from("deletion_requests")
        .upsert(
            {
                user_id: user.id,
                user_service_id,
                deletion_method: "email",
                status: "sent",
                sent_at: now,

                sender_email: gmailAddress,
                receiver_email,
                gmail_message_id: sent.id ?? null,
                thread_id: sent.threadId ?? null,
                template_used,

                // follow-up MVP fields
                follow_up_count: 0,
                next_follow_up_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),

                updated_at: now,
            },
            { onConflict: "user_id,user_service_id" }
        );

    if (upsertErr) {
        return NextResponse.json({ error: "Email sent, but failed to save deletion request" }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        gmail_message_id: sent.id ?? null,
        thread_id: sent.threadId ?? null,
        sender_email: gmailAddress,
        receiver_email,
        sent_at: now,
    });
}