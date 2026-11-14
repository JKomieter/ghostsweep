import { createClient } from '@/utils/supabase/server';
import { clearOAuthStateCookie, oauthStateMatches } from "@/utils/oauth-state";
import { microsoftRedirectUri } from "@/utils/microsoft-oauth";
import { encryptToken } from '@/utils/token_crypto';
import { NextRequest, NextResponse } from 'next/server';

const MICROSOFT_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const MICROSOFT_GRAPH_URL = 'https://graph.microsoft.com/v1.0/me';

// The state cookie is single-use: cleared on every response, whatever the outcome
export async function GET(req: NextRequest) {
    return clearOAuthStateCookie(await handleCallback(req), "microsoft_oauth_state");
}

async function handleCallback(req: NextRequest): Promise<NextResponse> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard';
        url.search = '';
        url.searchParams.set('microsoft_oauth_error', '1');
        return NextResponse.redirect(url);
    }


    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const returnedState = searchParams.get('state') || '';

    // Verify CSRF state matches what was set in the cookie
    const cookieState = req.cookies.get('microsoft_oauth_state')?.value;
    if (!oauthStateMatches(cookieState, returnedState)) {
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard';
        url.search = '';
        url.searchParams.set('microsoft_oauth_error', '1');
        return NextResponse.redirect(url);
    }

    if (error) {
        console.error('OAuth error:', error);
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard';
        url.search = '';
        url.searchParams.set('microsoft_oauth_error', 'denied');
        return NextResponse.redirect(url);
    }

    if (!code) {
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard';
        url.search = '';
        url.searchParams.set('microsoft_oauth_error', '1');
        return NextResponse.redirect(url);
    }

    try {
        // Must be identical to the redirect_uri sent in the authorization request
        const redirectUri = microsoftRedirectUri(req.nextUrl.origin);

        // Exchange code for token
        const tokenResponse = await fetch(MICROSOFT_TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.MICROSOFT_CLIENT_ID!,
                client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
                code,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }).toString(),
        });

        if (!tokenResponse.ok) {
            const error = await tokenResponse.json();
            console.error('Error exchanging code for token:', error);
            const url = req.nextUrl.clone();
            url.pathname = '/dashboard';
            url.search = '';
            url.searchParams.set('microsoft_oauth_error', '1');
            return NextResponse.redirect(url);
        }

        const tokens = await tokenResponse.json();

        // Get user profile
        const userResponse = await fetch(MICROSOFT_GRAPH_URL, {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        if (!userResponse.ok) {
            const url = req.nextUrl.clone();
            url.pathname = '/dashboard';
            url.search = '';
            url.searchParams.set('microsoft_oauth_error', '1');
            return NextResponse.redirect(url);
        }

        const microsoftUser = await userResponse.json();

        // encrypt tokens.access_token and tokens.refresh_token before storing
        const accessTokenEnc = encryptToken(tokens.access_token);
        const refreshTokenEnc = tokens.refresh_token ? encryptToken(tokens.refresh_token) : "";
        const email = microsoftUser.mail || microsoftUser.userPrincipalName;
        const displayName = microsoftUser.displayName;

        // Check if this Microsoft account already exists
        const { data: existingAccount } = await supabase
            .from('microsoft_accounts')
            .select('user_id')
            .eq('outlook_address', email)
            .single();

        let error = null;

        if (existingAccount) {
            // Account exists - check if it belongs to this user
            if (existingAccount.user_id === user.id) {
                // Update tokens for the same user
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const updateData: any = {
                    access_token_encrypted: accessTokenEnc,
                    token_expires_at: tokens.expires_in
                        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
                        : new Date().toISOString(),
                    display_name: displayName,
                    microsoft_user_id: microsoftUser.id,
                };

                if (refreshTokenEnc) {
                    updateData.refresh_token_encrypted = refreshTokenEnc;
                }

                const { error: updateError } = await supabase
                    .from('microsoft_accounts')
                    .update(updateData)
                    .eq('outlook_address', email);
                error = updateError;
            } else {
                // Account belongs to another user
                console.error('Microsoft account already connected to another user');
                const url = req.nextUrl.clone();
                url.pathname = '/dashboard';
                url.search = '';
                url.searchParams.set('microsoft_oauth_error', 'already_linked');
                return NextResponse.redirect(url);
            }
        } else {
            // New account - insert it
            const { error: insertError } = await supabase.from('microsoft_accounts').insert({
                user_id: user.id,
                outlook_address: email,
                access_token_encrypted: accessTokenEnc,
                refresh_token_encrypted: refreshTokenEnc, // Can be empty string now
                token_expires_at: tokens.expires_in
                    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
                    : new Date().toISOString(),
                display_name: displayName,
                microsoft_user_id: microsoftUser.id,
            });
            error = insertError;
        }

        if (error) {
            console.error('Error saving Microsoft account:', error);
            const url = req.nextUrl.clone();
            url.pathname = '/dashboard';
            url.search = '';
            url.searchParams.set('microsoft_oauth_error', '1');
            return NextResponse.redirect(url);
        }

        const { error: notifyError } = await supabase
            .from("user_notifications")
            .insert({
                user_id: user.id,
                type: "microsoft_connected",
                title: "Microsoft account connected",
                message: `Your Microsoft account (${email}) is now securely connected to GhostSweep.`,
                metadata: {
                    email: email,
                    provider: "microsoft",
                },
            });

        if (notifyError) {
            console.error("Error creating notification:", notifyError);
        }

        // Tell the dashboard which inbox just connected so it can offer to scan it straight away
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard';
        url.search = '';
        url.searchParams.set('connected', 'outlook');
        url.searchParams.set('account', email);
        return NextResponse.redirect(url);
    } catch (error) {
        console.error('Microsoft OAuth error:', error);
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard';
        url.search = '';
        url.searchParams.set('microsoft_oauth_error', '1');
        return NextResponse.redirect(url);
    }
}
