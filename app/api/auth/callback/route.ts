import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'
import { linkErrorPath } from '@/utils/auth-link-error'

const ALLOWED_HOSTS = ['ghostsweep.com', 'www.ghostsweep.com']

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next =  '/dashboard'
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Original host before the load balancer, but only if it's one of our own domains:
      // the redirect target can never be taken from an arbitrary header
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (!isLocalEnv && forwardedHost && ALLOWED_HOSTS.includes(forwardedHost)) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // An expired or already-used email link gets its own page; other failures go back to sign-in
  const linkError = linkErrorPath(searchParams)
  if (linkError) return NextResponse.redirect(`${origin}${linkError}`)

  return NextResponse.redirect(`${origin}/login?error=oauth`)
}