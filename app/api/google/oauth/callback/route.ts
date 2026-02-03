import { createClient } from "@/utils/supabase/server";
import { encryptToken } from "@/utils/token_crypto";
import { google } from "googleapis";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        url.searchParams.set('google_oauth_error', '1');
        return NextResponse.redirect(url)
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code") || "";
    const returnedState = searchParams.get("state") || "";

    // 1. Read the state we stored earlier
    const cookieState = request.cookies.get("gmail_oauth_state")?.value;

    // 2. Verify state
    if (!cookieState || !returnedState || cookieState !== returnedState) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        url.searchParams.set('google_oauth_error', '1');
        return NextResponse.redirect(url)
    }

    try {
        const clientId = process.env.GOOGLE_CLIENT_ID!;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
        const redirectUri = process.env.NODE_ENV === "production" ? process.env.GOOGLE_REDIRECT_URI! : process.env.GOOGLE_REDIRECT_URI_DEV!;

        const oauth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            redirectUri,
        );

        // 3. Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // 4. Get the email of the authenticated user
        const oauth2 = google.oauth2("v2");
        const { data: userInfo } = await oauth2.userinfo.get({
            auth: oauth2Client,
        });

        const accessTokenEnc = encryptToken(tokens.access_token || "");
        // Only encrypt refresh token if Google returned one (they only return it on first consent)
        const refreshTokenEnc = tokens.refresh_token ? encryptToken(tokens.refresh_token) : "";

        // 5. Check if this Gmail account already exists
        const { data: existingAccount } = await supabase
            .from("gmail_accounts")
            .select("user_id, refresh_token_encrypted")
            .eq("gmail_address", userInfo.email!)
            .single();

        let error = null;

        if (existingAccount) {
            // Account exists - check if it belongs to this user
            if (existingAccount.user_id === user.id) {
                // Update tokens for the same user
                // Only update refresh_token if Google returned a new one, otherwise keep existing
                const updateData: Record<string, string> = {
                    access_token_encrypted: accessTokenEnc,
                    token_expires_at: tokens.expiry_date
                        ? new Date(tokens.expiry_date).toISOString()
                        : new Date().toISOString(),
                };
                
                // Only overwrite refresh token if we got a new one from Google
                if (refreshTokenEnc) {
                    updateData.refresh_token_encrypted = refreshTokenEnc;
                }
                
                const { error: updateError } = await supabase
                    .from("gmail_accounts")
                    .update(updateData)
                    .eq("gmail_address", userInfo.email!);
                error = updateError;
            } else {
                // Account belongs to another user
                console.error("Gmail account already connected to another user");
                const url = request.nextUrl.clone()
                url.pathname = '/dashboard'
                url.searchParams.set('google_oauth_error', '1');
                return NextResponse.redirect(url)
            }
        } else {
            // New account - insert it
            // We might not get a refresh token if access_type is online, which is fine for transient scans
            const { error: insertError } = await supabase
                .from("gmail_accounts")
                .insert({
                    user_id: user.id,
                    gmail_address: userInfo.email!,
                    access_token_encrypted: accessTokenEnc,
                    refresh_token_encrypted: refreshTokenEnc,
                    token_expires_at: tokens.expiry_date
                        ? new Date(tokens.expiry_date).toISOString()
                        : new Date().toISOString(),
                });
            error = insertError;
        }

        if (error) {
            console.error("Supabase upsert error:", error);
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            url.searchParams.set('google_oauth_error', '1');
            return NextResponse.redirect(url)
        }

        // 6. Optionally clear the state cookie now that we’re done
        const res = NextResponse.redirect(new URL("/dashboard", request.url));
        res.cookies.set("gmail_oauth_state", "", {
            maxAge: 0,
            path: "/",
        });

        // Insert notification for Gmail
        const { error: notifyError } = await supabase
            .from("user_notifications")
            .insert({
                user_id: user.id,
                type: "gmail_connected",
                title: "Gmail connected",
                message: `Your Gmail account (${userInfo.email!}) is now securely connected to GhostSweep.`,
                metadata: {
                    gmail: userInfo.email!,
                },
            });
        if (notifyError) {
            console.error("Error creating notification:", notifyError);
        }

        return res;
    } catch (error) {
        console.error("Error during OAuth callback:", error);
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        url.searchParams.set('google_oauth_error', '1');
        return NextResponse.redirect(url)
    }
}