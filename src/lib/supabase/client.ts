import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in the browser (React components).
 *
 * This is used in client components (anything with 'use client') to
 * talk to your Supabase database, auth, and realtime subscriptions.
 *
 * Think of it like a "connection" to your database that runs in the
 * user's browser.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
