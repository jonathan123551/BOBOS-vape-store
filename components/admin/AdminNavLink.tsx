"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg text-sm transition ${
        active ? "bg-brand-700/20 text-brand-300 neon-border" : "hover:bg-[rgb(var(--card))]"
      }`}
    >
      {label}
    </Link>
  );
}
