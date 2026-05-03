import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useLang } from "@/contexts/LangContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Logo } from "./Logo";

export function Header() {
  const { dict, lang, toggle: toggleLang } = useLang();
  const { theme, toggle: toggleTheme } = useTheme();
  const { count } = useCart();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: dict.nav.home },
    { to: "/products", label: dict.nav.products },
    { to: "/cart", label: dict.nav.cart },
    { to: "/contact", label: dict.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-[rgb(var(--bg))]/70 border-b border-[rgb(var(--border))]">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="shrink-0" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 text-sm rounded-lg transition ${
                  active
                    ? "bg-brand-600/20 text-brand-300"
                    : "hover:bg-[rgb(var(--card))] hover:text-brand-400"
                }`}
              >
                {l.label}
                {l.to === "/cart" && count > 0 ? (
                  <span className="ms-2 inline-flex items-center justify-center rounded-full bg-brand-600 text-white text-xs px-1.5 min-w-5 h-5">
                    {count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLang}
            className="btn-ghost h-9 px-3 text-xs"
            aria-label="Switch language"
            title={dict.common.switchLang}
          >
            {lang === "en" ? "AR" : "EN"}
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="btn-ghost h-9 w-9 !p-0"
            aria-label={dict.common.switchTheme}
            title={dict.common.switchTheme}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <button
            type="button"
            className="btn-ghost h-9 w-9 !p-0 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="menu"
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[rgb(var(--border))]">
          <nav className="container-page flex flex-col py-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-2 py-3 rounded-lg hover:bg-[rgb(var(--card))]"
              >
                {l.label}
                {l.to === "/cart" && count > 0 ? (
                  <span className="ms-2 inline-flex items-center justify-center rounded-full bg-brand-600 text-white text-xs px-1.5 min-w-5 h-5">
                    {count}
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
