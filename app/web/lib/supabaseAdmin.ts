import { createClient } from '@supabase/supabase-js'

/**
 * SERVICE ROLE CLIENT
 * This client bypasses Row Level Security (RLS).
 * MUST ONLY BE USED in server-side routes like webhooks or payment verification.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseServiceKey) {
    throw new Error('MISSING_SUPABASE_SERVICE_ROLE_KEY: Check your .env setup.')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
