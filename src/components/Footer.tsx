import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";
import { Logo } from "./Logo";

const PHONE = (import.meta.env.VITE_STORE_PHONE as string | undefined) || "01287566246";
const WHATSAPP =
  (import.meta.env.VITE_WHATSAPP_LINK as string | undefined) ||
  "https://chat.whatsapp.com/Es1cmi0a7Mp8Qz4PtyiDgF?mode=hqctcli";

export function Footer() {
  const { dict } = useLang();

  return (
    <footer className="border-t border-[rgb(var(--border))] mt-20">
      <div className="container-page py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm opacity-70 max-w-sm">{dict.tagline}</p>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider opacity-80">
            {dict.nav.products}
          </h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li>
              <Link to="/products" className="hover:text-brand-400">
                {dict.products.title}
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-brand-400">
                {dict.nav.cart}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-brand-400">
                {dict.nav.contact}
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider opacity-80">
            {dict.nav.contact}
          </h4>
          <p className="text-sm opacity-80">
            <a className="hover:text-brand-400" href={`tel:${PHONE}`} dir="ltr">
              {PHONE}
            </a>
          </p>
          <p className="text-sm opacity-80">
            <a className="hover:text-brand-400" href={WHATSAPP} target="_blank" rel="noreferrer">
              WhatsApp Group
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-[rgb(var(--border))] py-4 text-center text-xs opacity-60">
        © {new Date().getFullYear()} BOBOS Vapes Store
      </div>
    </footer>
  );
}
