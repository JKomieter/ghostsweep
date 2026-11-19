import { createClient } from '@supabase/supabase-js'

// Service-role client for server-to-server work with no signed-in user (e.g. security webhooks).
// Bypasses RLS: only use it in server code, and only for narrowly scoped calls.
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } }
    )
}
