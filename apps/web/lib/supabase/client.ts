import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

// createClient — for use in browser / client components only.
// Uses anon key only. Subject to RLS.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
