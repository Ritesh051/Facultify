import { createClient } from '@supabase/supabase-js'

// Service-role client — bypasses RLS entirely.
// ONLY use in server-side code (Server Actions, Route Handlers, Edge Functions).
// NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser.
//
// Deliberately untyped (no <Database> generic) — same convention as the
// browser client in lib/supabase-service.ts: our mapper functions and the
// explicit casts at each call site provide domain-level type safety instead
// of relying on Supabase's generated-type select/update string parsing,
// which doesn't reliably infer for hand-maintained bootstrap schemas.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
