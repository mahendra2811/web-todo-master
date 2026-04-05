import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Service role client — ONLY for use in edge functions / server-side
// NEVER expose this in client-side code
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
