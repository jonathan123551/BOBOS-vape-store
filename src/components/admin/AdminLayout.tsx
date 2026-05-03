import { useState, type ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Logo } from "@/components/Logo";

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: "📊" },
  { to: "/admin/orders", label: "Orders", icon: "📦" },
  { to: "/admin/products", label: "Products", icon: "💨" },
  { to: "/admin/categories", label: "Categories", icon: "🏷️" },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { signOut, mode } = useAdminAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[rgb(var(--bg))]">
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 h-14 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]/90 backdrop-blur">
        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMobileNavOpen((v) => !v)}
          className="btn-ghost h-9 w-9 !p-0"
        >
          ☰
        </button>
        <Link to="/admin" className="flex-1">
          <Logo size={28} />
        </Link>
        <button type="button" onClick={handleSignOut} className="btn-ghost h-9 px-3 text-xs">
          Sign out
        </button>
      </header>

      {/* Sidebar (desktop) + mobile drawer overlay */}
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="md:hidden fixed inset-0 bg-black/60 z-30"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <aside
        className={`fixed md:static z-40 top-0 start-0 h-full md:h-auto w-64 md:w-60 shrink-0 border-e border-[rgb(var(--border))] bg-[rgb(var(--card))] transform transition md:transform-none ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="hidden md:flex items-center gap-2 h-16 px-5 border-b border-[rgb(var(--border))]">
          <Link to="/admin" className="flex items-center gap-2">
            <Logo size={28} />
          </Link>
        </div>

        <nav className="p-3 flex flex-col gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/admin"}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-brand-600/20 text-brand-300"
                    : "hover:bg-black/20 text-[rgb(var(--fg))]/80"
                }`
              }
            >
              <span aria-hidden="true">{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 mt-auto">
          {mode === "demo" && (
            <p className="text-[11px] opacity-70 px-2 mb-3">
              Demo mode — connect Supabase to persist changes.
            </p>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="hidden md:inline-flex btn-ghost w-full text-sm"
          >
            Sign out
          </button>
          <Link
            to="/"
            className="hidden md:inline-flex btn-ghost w-full text-sm mt-2"
          >
            ← Back to store
          </Link>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        {mode === "demo" && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-200 text-xs px-4 py-2 text-center">
            Demo mode — admin runs against the static seed. Connect Supabase to
            enable saving, image uploads, and order management.
          </div>
        )}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
