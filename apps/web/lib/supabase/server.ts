import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

// createClient — for server components and route handlers.
// Uses anon key + cookie-based session. Subject to RLS.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Silently ignored in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Silently ignored in Server Components
          }
        },
      },
    }
  );
}

// createServiceClient — for background jobs and workers.
// Uses service role key — BYPASSES RLS.
// WARNING: Only use in trusted server-side contexts (jobs, migrations, admin scripts).
export function createServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Cannot create service client."
    );
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      cookies: {
        get: () => undefined,
        set: () => undefined,
        remove: () => undefined,
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
