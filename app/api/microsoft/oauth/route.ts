import { NextResponse } from 'next/server';

const MICROSOFT_AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';

export async function GET() {
  const isProduction = process.env.NODE_ENV === 'production';
  const redirectUri = isProduction
    ? 'https://ghostsweep.com/api/microsoft/oauth/callback'
    : 'http://localhost:3000/api/microsoft/oauth/callback';
  
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email User.Read Mail.ReadBasic openid profile',
    response_mode: 'query',
  });

  return NextResponse.redirect(`${MICROSOFT_AUTH_URL}?${params.toString()}`);
}
