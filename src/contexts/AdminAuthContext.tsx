import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

/**
 * Single-admin auth.
 *
 * Production (Supabase configured):
 *   Username `admin` is mapped to email `admin@bobos.local` and authenticated
 *   via Supabase Auth. RLS in `supabase/migrations/20260503000001_admin_rls.sql`
 *   enforces single-admin writes.
 *
 * Demo mode (Supabase NOT configured):
 *   Username + password are checked against hard-coded defaults so the admin
 *   UI is fully demo-able on Lovable preview. CRUD operations no-op with a
 *   "Demo mode — connect Supabase to persist" toast, but reads work against
 *   the static seed.
 */
export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "bobos-admin-2026";
export const ADMIN_EMAIL = "admin@bobos.local";
const DEMO_FLAG_KEY = "bobos_admin_demo_v1";

type AdminMode = "supabase" | "demo";

interface AdminAuthContextValue {
  mode: AdminMode;
  isAuthed: boolean;
  loading: boolean;
  email: string | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const mode: AdminMode = isSupabaseConfigured ? "supabase" : "demo";
  const [isAuthed, setIsAuthed] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial auth check + subscribe to changes (Supabase) / read flag (demo).
  useEffect(() => {
    let unsub: (() => void) | undefined;

    async function init() {
      if (mode === "supabase" && supabase) {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        const userEmail = session?.user?.email ?? null;
        setIsAuthed(!!session && userEmail === ADMIN_EMAIL);
        setEmail(userEmail);
        setLoading(false);

        const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
          const e = s?.user?.email ?? null;
          setIsAuthed(!!s && e === ADMIN_EMAIL);
          setEmail(e);
        });
        unsub = () => sub.subscription.unsubscribe();
      } else {
        try {
          const flag = localStorage.getItem(DEMO_FLAG_KEY);
          setIsAuthed(flag === "1");
          setEmail(flag === "1" ? ADMIN_EMAIL : null);
        } catch {
          /* ignore */
        }
        setLoading(false);
      }
    }

    void init();
    return () => {
      unsub?.();
    };
  }, [mode]);

  const signIn = useCallback<AdminAuthContextValue["signIn"]>(
    async (username, password) => {
      const u = username.trim().toLowerCase();
      const isUsername = u === ADMIN_USERNAME;
      const isEmail = u === ADMIN_EMAIL;
      if (!isUsername && !isEmail) {
        throw new Error("Invalid credentials");
      }
      const targetEmail = ADMIN_EMAIL;

      if (mode === "supabase" && supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password,
        });
        if (error) {
          throw new Error(error.message || "Invalid credentials");
        }
        return;
      }

      // Demo mode: hard-coded check.
      if (password !== ADMIN_PASSWORD) {
        throw new Error("Invalid credentials");
      }
      try {
        localStorage.setItem(DEMO_FLAG_KEY, "1");
      } catch {
        /* ignore */
      }
      setIsAuthed(true);
      setEmail(ADMIN_EMAIL);
    },
    [mode],
  );

  const signOut = useCallback(async () => {
    if (mode === "supabase" && supabase) {
      await supabase.auth.signOut();
    } else {
      try {
        localStorage.removeItem(DEMO_FLAG_KEY);
      } catch {
        /* ignore */
      }
      setIsAuthed(false);
      setEmail(null);
    }
  }, [mode]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({ mode, isAuthed, loading, email, signIn, signOut }),
    [mode, isAuthed, loading, email, signIn, signOut],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
