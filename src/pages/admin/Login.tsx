import { useState, type FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  useAdminAuth,
} from "@/contexts/AdminAuthContext";
import { Logo } from "@/components/Logo";

export function AdminLogin() {
  const { isAuthed, signIn, mode } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  if (isAuthed) {
    const from = (location.state as { from?: string } | null)?.from ?? "/admin";
    navigate(from, { replace: true });
    return null;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const username = String(fd.get("username") || "");
    const password = String(fd.get("password") || "");
    setSubmitting(true);
    try {
      await signIn(username, password);
      toast.success("Welcome back");
      navigate("/admin", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <div className="card neon-border w-full max-w-md p-6 sm:p-8 space-y-5">
        <div className="flex flex-col items-center gap-2">
          <Logo size={56} withText={false} />
          <h1 className="text-2xl font-bold glow-text">Admin sign in</h1>
          <p className="text-xs opacity-70 text-center">
            Single-account access to the BOBOS admin panel.
          </p>
        </div>

        {mode === "demo" && (
          <div className="text-xs rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-200 p-3 leading-relaxed">
            <strong>Demo mode.</strong> Connect Supabase to persist changes.
            Default credentials:
            <code className="block font-mono mt-1">
              {ADMIN_USERNAME} / {ADMIN_PASSWORD}
            </code>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm opacity-80">Username</span>
            <input
              name="username"
              autoComplete="username"
              required
              defaultValue={mode === "demo" ? ADMIN_USERNAME : ""}
              className="input mt-1"
              dir="ltr"
              placeholder="admin"
            />
          </label>
          <label className="block">
            <span className="text-sm opacity-80">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="input mt-1"
              dir="ltr"
              placeholder="••••••••"
            />
          </label>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="text-center text-xs opacity-70">
          <Link to="/" className="hover:underline">
            ← Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
