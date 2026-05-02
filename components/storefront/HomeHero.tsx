"use client";

import Link from "next/link";
import { useLang } from "../LangContext";
import { Logo } from "../Logo";

export function HomeHero() {
  const { dict } = useLang();
  return (
    <section className="relative overflow-hidden border-b border-[rgb(var(--border))]">
      <div className="absolute inset-0 -z-10 bg-smoke-radial" />
      <div className="smoke-wisp -z-10" />
      <div className="container-page py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <span className="pill-accent">BOBOS</span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight glow-text leading-tight">
            {dict.home.heroTitle}
          </h1>
          <p className="text-lg opacity-80 max-w-xl">{dict.home.heroSubtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="btn-primary">
              {dict.home.shopNow}
            </Link>
            <Link href="/contact" className="btn-ghost">
              {dict.nav.contact}
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="card neon-border p-10 grid place-items-center aspect-[4/3] bg-gradient-to-br from-brand-700/20 to-cyan-500/10">
            <Logo size={160} withText={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
