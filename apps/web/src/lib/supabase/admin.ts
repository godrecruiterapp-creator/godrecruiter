import { createClient } from '@supabase/supabase-js'

// Service-role admin client — ONLY for server-side platform operations
// (schema provisioning, tenant creation, pool management)
// NEVER expose to client or use in user-facing request handlers
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
