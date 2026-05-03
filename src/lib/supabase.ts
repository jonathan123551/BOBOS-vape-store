import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = (import.meta.env.VITE_SUPABASE_URL ?? "").trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

/**
 * Whether a Supabase project URL + anon key are present.
 * When false, the app falls back to the static seed in `src/lib/seed.ts`
 * so it can run on Lovable/local immediately without configuration.
 */
export const isSupabaseConfigured =
  !!url &&
  !!anonKey &&
  url.startsWith("https://") &&
  !url.includes("YOUR-PROJECT-REF");

// We keep the Supabase client untyped (no Database generic) and cast query
// results inside `lib/products.ts` and `lib/orders.ts`. This keeps the build
// from getting tangled in Postgrest's deeply-recursive generics; row shape is
// still type-safe at the application layer (Product, Category, Order interfaces).
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
