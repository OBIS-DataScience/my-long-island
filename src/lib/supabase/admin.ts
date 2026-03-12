import { createClient } from "@supabase/supabase-js";

/**
 * Supabase "admin" client — uses the SERVICE ROLE key.
 *
 * The service role key bypasses Row-Level Security (RLS), which
 * means it can INSERT/UPDATE data even though our tables only
 * allow public READ. This is what our cron routes use to write
 * fresh data into the database.
 *
 * IMPORTANT: This must NEVER be used in client-side (browser) code.
 * It only runs inside API routes on the server.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars"
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
