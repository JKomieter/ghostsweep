import { createClient } from "@/utils/supabase/server";
import { listEmails } from "@/utils/sweep/list-emails";
import { decryptToken, encryptToken } from "@/utils/token-crypto";
import { gmail_v1, google } from "googleapis";
import { NextResponse } from "next/server";
import {
    EmailMetadata,
    getEmailMetadataFromClient,
    // getEmailMetadataFromClient,
} from "@/utils/sweep/get-email-metadata";
import { summarizeByDomain } from "@/utils/sweep/summarize-by-domain";
import { getBreaches } from "@/utils/sweep/get-breaches";


// limit parallel Gmail calls to avoid timeouts / rate limits
const FREE_CONCURRENCY = 4;
const PRO_CONCURRENCY = 10;

async function fetchMetadataForMessages(
    gmail: gmail_v1.Gmail,
    messages: gmail_v1.Schema$Message[],
    current_plan: "free" | "pro"
): Promise<EmailMetadata[]> {
    const CONCURRENCY =
        current_plan === "pro" ? PRO_CONCURRENCY : FREE_CONCURRENCY;

    const results: EmailMetadata[] = [];
    let index = 0;

    async function worker() {
        // simple work-queue pattern
        while (index < messages.length) {
            const i = index++;
            const msg = messages[i];
            if (!msg.id) continue;

            try {
                const meta = await getEmailMetadataFromClient(gmail, msg.id);
                results.push(meta);
            } catch (err) {
                console.error(`Error fetching metadata for ${msg.id}:`, err);
            }
        }
    }

    // spin up N workers in parallel
    const workers = Array.from({ length: CONCURRENCY }, () => worker());
    await Promise.all(workers);

    return results;
}


export async function GET() {
    const scanStartedAt = Date.now();
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // check if user is free — only allow one sweep per month
    // get user subscription
    const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("user_subscriptions")
        .select("current_plan, last_sweep_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .single();

    if (subscriptionError && subscriptionError.code !== "PGRST116") {
        console.error("Error fetching subscription data:", subscriptionError);
        return NextResponse.json(
            { error: "Internal Server Error", code: "INTERNAL_SERVER_ERROR" },
            { status: 500 }
        );
    }

    // If user is FREE, enforce monthly limit
    if (subscriptionData?.current_plan !== "pro" && subscriptionData?.last_sweep_at) {
        const lastSweep = new Date(subscriptionData.last_sweep_at);
        const now = new Date();
        
        const sameMonth =
            lastSweep.getUTCFullYear() === now.getUTCFullYear() &&
            lastSweep.getUTCMonth() === now.getUTCMonth();

        if (sameMonth) {
            return NextResponse.json(
                {
                    error: "Monthly limit reached",
                    code: "MONTHLY_LIMIT_REACHED",
                    message: "You've already used your free sweep for this month. Upgrade to Professional to unlock unlimited scans."
                },
                { status: 403 }
            );
        }
    }

    // get the gmail account
    const { data: gmailAccount, error: gmailAccountError } = await supabase
        .from("gmail_accounts")
        .select(
            "gmail_address, access_token_encrypted, refresh_token_encrypted, token_expires_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .single();

    if (gmailAccountError && gmailAccountError.code !== "PGRST116") {
        console.error("Error fetching Gmail account:", gmailAccountError);
        return NextResponse.json(
            { error: "Internal Server Error", code: "GMAIL_ACCOUNT_NOT_FOUND" },
            { status: 500 }
        );
    } else if (gmailAccountError && gmailAccountError.code === "PGRST116") {
        return NextResponse.json(
            { error: "No Gmail account connected", code: "GMAIL_ACCOUNT_NOT_FOUND" },
            { status: 404 }
        );
    }

    if (!gmailAccount) {
        return NextResponse.json(
            { error: "No Gmail account connected", code: "GMAIL_ACCOUNT_NOT_FOUND" },
            { status: 404 }
        );
    }

    // decrypt tokens
    const decryptedAccessToken = decryptToken(
        gmailAccount.access_token_encrypted
    );
    const decryptedRefreshToken = decryptToken(
        gmailAccount.refresh_token_encrypted
    );

    // prepare OAuth client
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = process.env.NODE_ENV === "production" ? process.env.GOOGLE_REDIRECT_URI! : process.env.GOOGLE_REDIRECT_URI_DEV!;
    const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
    );
    oauth2Client.setCredentials({
        access_token: decryptedAccessToken,
        refresh_token: decryptedRefreshToken,
    });

    // check expiry & refresh if needed
    let accessTokenToUse = decryptedAccessToken;

    try {
        const currentTimeSec = Math.floor(scanStartedAt / 1000);

        // if token_expires_at is stored as ISO string, do this instead:
        // const tokenExpirySec = Math.floor(new Date(gmailAccount.token_expires_at).getTime() / 1000);
        const tokenExpirySec = gmailAccount.token_expires_at;

        if (!tokenExpirySec || tokenExpirySec < currentTimeSec) {
            // try to refresh using refresh token
            const { credentials } = await oauth2Client.refreshAccessToken();

            if (!credentials.access_token) {
                throw new Error("No access token in refreshed credentials");
            }

            accessTokenToUse = credentials.access_token;

            // update DB with new encrypted token + expiry
            const newExpirySec = credentials.expiry_date
                ? Math.floor(credentials.expiry_date / 1000)
                : currentTimeSec + 3600; // fallback: +1h

            const { error: updateError } = await supabase
                .from("gmail_accounts")
                .update({
                    access_token_encrypted: encryptToken(accessTokenToUse),
                    token_expires_at: newExpirySec,
                    updated_at: new Date().toISOString(),
                })
                .eq("user_id", user.id);

            if (updateError) {
                console.error("Failed to update refreshed token:", updateError);
            }
        }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error("Error refreshing Gmail token:", err?.response?.data || err);

        // invalid_grant usually means user revoked access or refresh token is dead
        const message =
            err?.response?.data?.error || err?.message || "Token refresh failed";

        if (message.includes("invalid_grant")) {
            return NextResponse.json(
                {
                    error: "Gmail connection expired or revoked. Please reconnect.",
                    code: "GMAIL_RECONNECT_REQUIRED",
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Failed to refresh Gmail token" },
            { status: 500 }
        );
    }

    // now use the final access token
    oauth2Client.setCredentials({
        access_token: accessTokenToUse,
        refresh_token: decryptedRefreshToken,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const current_plan = subscriptionData?.current_plan || "free";

    const messages = await listEmails(current_plan, gmail);
    console.log("Number of messages: ", messages.length)
    // Optional: cap how many messages we *process* further
    // const MAX_TO_PROCESS = current_plan === "pro" ? 300 : 120;
    // const messagesToProcess = messages.slice(0, MAX_TO_PROCESS);

    const metadataList = await fetchMetadataForMessages(
        gmail,
        messages,
        current_plan as "free" | "pro"
    );


    // summarize by domain
    const domainSummaries = await summarizeByDomain(metadataList);

    // get breaches
    const breaches = await getBreaches(gmailAccount.gmail_address);

    // save via edge function as before
    await supabase.functions.invoke("save-sweep-data", {
        body: {
            userId: user.id,
            email: gmailAccount.gmail_address,
            summary: domainSummaries || [],
            breaches: breaches || [],
            scanStartedAt: new Date(scanStartedAt).toISOString(),
        },
    });

    return NextResponse.json({ message: "Sweep completed successfully" });
}