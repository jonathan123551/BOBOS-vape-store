import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useLang } from "@/contexts/LangContext";

const HIDDEN_PATHS = ["/cart", "/checkout"];

export function FloatingCartButton() {
  const { count, hydrated } = useCart();
  const { dict } = useLang();
  const { pathname } = useLocation();

  if (!hydrated) return null;
  if (count === 0) return null;
  if (pathname.startsWith("/admin")) return null;
  if (HIDDEN_PATHS.includes(pathname)) return null;

  return (
    <Link
      to="/cart"
      aria-label={dict.cart.openCart}
      title={dict.cart.openCart}
      className="fixed bottom-6 end-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      style={{
        background: "linear-gradient(135deg, #7c3aed, #a855f7)",
        boxShadow:
          "0 10px 24px rgba(168, 85, 247, 0.45), 0 0 18px rgba(168, 85, 247, 0.35)",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
      </svg>
      <span
        aria-hidden="true"
        className="absolute -top-1.5 -end-1.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-[rgb(var(--bg))] bg-cyan-400 px-1.5 text-xs font-bold text-black"
      >
        {count > 99 ? "99+" : count}
      </span>
    </Link>
  );
}
