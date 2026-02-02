// app/api/broker/[brokerId]/send-opt-out/route.ts

import { tokenStillValid, refreshAccessToken } from "@/utils/refresh_access_token";
import sendEmail from "@/utils/send_email";
import { createClient } from "@/utils/supabase/server";
import { decryptToken, encryptToken } from "@/utils/token_crypto";
import { NextRequest, NextResponse } from "next/server";


export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ brokerId: string }> }
) {
    const supabase = await createClient();

    // 1) Auth
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    const { email } = await req.json();
    const brokerId = (await params).brokerId;

    // Validate email structure
    if (!email?.subject || !email?.body || !email?.to) {
        return NextResponse.json({ error: "Invalid email data" }, { status: 400 });
    }

    // Create opt-out request record
    const { data: optOutRequest, error: insertError } = await supabase
        .from("opt_out_requests")
        .upsert(
            {
                user_id: userId,
                broker_id: brokerId,
                status: "in_progress",
                method: "email",
                expired_at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days
            },
            {
                onConflict: "user_id,broker_id",
                ignoreDuplicates: false,
            }
        )
        .select()
        .single();

    if (insertError) {
        console.error("Failed to create opt-out request:", insertError);
        return NextResponse.json(
            { error: "Failed to track opt-out request" },
            { status: 500 }
        );
    }

    // Load Gmail connection
    const { data: conn, error: connErr } = await supabase
        .from("gmail_accounts")
        .select("gmail_address, access_token_encrypted, refresh_token_encrypted, token_expires_at")
        .eq("user_id", user.id)
        .maybeSingle();

    if (connErr) return NextResponse.json({ error: "Failed to load Gmail connection" }, { status: 500 });
    if (!conn) return NextResponse.json({ error: "Gmail not connected" }, { status: 400 });


    const gmailAddress = conn.gmail_address as string;
    let accessToken = decryptToken(conn.access_token_encrypted as string);
    const refreshToken = decryptToken(conn.refresh_token_encrypted as string);

    // Refresh token if needed; optionally persist new expires time
    if (!tokenStillValid(conn.token_expires_at as string | null)) {
        const refreshed = await refreshAccessToken(refreshToken);
        accessToken = refreshed.access_token;

        const newExpiresAt = new Date(Date.now() + Number(refreshed.expires_in) * 1000).toISOString();
        // Save both the new access token AND expiry time
        await supabase
            .from("gmail_accounts")
            .update({ 
                token_expires_at: newExpiresAt,
                access_token_encrypted: encryptToken(accessToken),
            })
            .eq("user_id", user.id)
            .eq("gmail_address", gmailAddress);
    }

    // send the email
    await sendEmail({
        accessToken,
        from: gmailAddress,
        to: email.to,
        subject: email.subject,
        body: email.body,
    });

    return NextResponse.json({
        success: true,
        request: optOutRequest,
    });
}