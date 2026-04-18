import { createClient } from '@supabase/supabase-js'

/**
 * SERVICE ROLE CLIENT
 * This client bypasses Row Level Security (RLS).
 * MUST ONLY BE USED in server-side routes like webhooks or payment verification.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    const missing = !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : 'SUPABASE_SERVICE_ROLE_KEY';
    throw new Error(`CRITICAL_MISSING_ENV_VAR: ${missing} is not defined in the environment. Payments and Admin actions will fail until this is set in Vercel.`);
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
