import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminFromCookies } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { AdminLogout } from "@/components/admin/AdminLogout";
import { AdminNavLink } from "@/components/admin/AdminNavLink";

export const dynamic = "force-dynamic";

export default function AuthedAdminLayout({ children }: { children: React.ReactNode }) {
  if (!getAdminFromCookies()) redirect("/admin/login");

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/categories", label: "Categories" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-60 shrink-0 border-b md:border-b-0 md:border-e border-[rgb(var(--border))] p-4 md:sticky md:top-0 md:h-screen flex md:flex-col gap-2 items-center md:items-stretch overflow-x-auto">
        <Link href="/admin" className="px-2 py-3 hidden md:block">
          <Logo />
        </Link>
        <nav className="flex md:flex-col gap-1 flex-1 md:py-2">
          {links.map((l) => (
            <AdminNavLink key={l.href} href={l.href} label={l.label} />
          ))}
        </nav>
        <div className="md:mt-auto flex flex-col gap-1">
          <Link href="/" className="px-3 py-2 rounded-lg text-xs opacity-70 hover:opacity-100">
            ← Back to store
          </Link>
          <AdminLogout />
        </div>
      </aside>
      <div className="flex-1 p-4 md:p-8 max-w-full overflow-x-auto">{children}</div>
    </div>
  );
}
