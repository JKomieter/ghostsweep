import { createClient } from '@/utils/supabase/server';
import { encryptToken } from '@/utils/token_crypto';
import { NextRequest, NextResponse } from 'next/server';

const MICROSOFT_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const MICROSOFT_GRAPH_URL = 'https://graph.microsoft.com/v1.0/me';

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard';
        url.searchParams.set('microsoft_oauth_error', '1');
        return NextResponse.redirect(url);
    }


    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        console.error('OAuth error:', error);
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard';
        url.searchParams.set('microsoft_oauth_error', '1');
        return NextResponse.redirect(url);
    }

    if (!code) {
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard';
        url.searchParams.set('microsoft_oauth_error', '1');
        return NextResponse.redirect(url);
    }

    try {
        const isProduction = process.env.NODE_ENV === 'production';
        const redirectUri = isProduction
            ? 'https://ghostsweep.com/api/microsoft/oauth/callback'
            : 'http://localhost:3000/api/microsoft/oauth/callback';

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
            url.searchParams.set('microsoft_oauth_error', '1');
            return NextResponse.redirect(url);
        }

        const user = await userResponse.json();

        // encrypt tokens.access_token and tokens.refresh_token before storing
        const accessTokenEnc = encryptToken(tokens.access_token);
        const refreshTokenEnc = encryptToken(tokens.refresh_token);
        const email = user.mail || user.userPrincipalName;
        const displayName = user.displayName;

        // store the tokens and user info in your database
        const { error } = await supabase.functions.invoke('save-gmail-account', {
            body: {
                provider: 'microsoft',
                userId: user.id,
                email,
                accessTokenEnc,
                refreshTokenEnc,
                tokenExpiresAt: tokens.expires_in
                    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
                    : new Date().toISOString(),
                displayName,
            },
            headers: {
                "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
            }
        });

        if (error) {
            console.error('Error saving Microsoft account:', error);
            const url = req.nextUrl.clone();
            url.pathname = '/dashboard';
            url.searchParams.set('microsoft_oauth_error', '1');
            return NextResponse.redirect(url);
        }

        // Redirect to dashboard or another page
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    } catch (error) {
        console.error('Microsoft OAuth error:', error);
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard';
        url.searchParams.set('microsoft_oauth_error', '1');
        return NextResponse.redirect(url);
    }
}
