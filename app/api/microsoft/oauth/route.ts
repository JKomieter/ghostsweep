import { NextResponse } from 'next/server';
import crypto from 'crypto';

const MICROSOFT_AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';

export async function GET() {
  const isProduction = process.env.NODE_ENV === 'production';
  const redirectUri = isProduction
    ? 'https://ghostsweep.com/api/microsoft/oauth/callback'
    : 'http://localhost:3000/api/microsoft/oauth/callback';

  // Generate a cryptographically random state value to prevent CSRF attacks
  const state = crypto.randomBytes(32).toString('hex');

  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email User.Read Mail.ReadBasic openid profile offline_access',
    response_mode: 'query',
    state,
  });

  const res = NextResponse.redirect(`${MICROSOFT_AUTH_URL}?${params.toString()}`);

  // Store state in a secure httpOnly cookie for verification in the callback
  res.cookies.set('microsoft_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 10 * 60, // 10 minutes
    path: '/',
  });

  return res;
}
