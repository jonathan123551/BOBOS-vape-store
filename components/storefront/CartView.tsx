"use client";

import Link from "next/link";
import { useCart } from "../CartContext";
import { useLang } from "../LangContext";
import { formatPrice } from "@/lib/format";

export function CartView() {
  const { items, setQty, remove, total, hydrated } = useCart();
  const { dict, lang } = useLang();

  if (!hydrated) return <p className="opacity-70">{dict.common.loading}</p>;

  if (items.length === 0) {
    return (
      <div className="card neon-border p-10 text-center space-y-4">
        <h1 className="text-3xl font-bold glow-text">{dict.cart.title}</h1>
        <p className="opacity-70">{dict.cart.empty}</p>
        <Link href="/products" className="btn-primary inline-flex">
          {dict.cart.continue}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl md:text-4xl font-bold glow-text">{dict.cart.title}</h1>

      {/* Mobile: stacked cards */}
      <ul className="md:hidden space-y-3" role="list">
        {items.map((i) => {
          const name = lang === "ar" && i.nameAr ? i.nameAr : i.name;
          return (
            <li key={i.productId} className="card neon-border p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 shrink-0 rounded-lg bg-black/30 overflow-hidden grid place-items-center">
                  {i.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.image} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">💨</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium leading-tight">{name}</p>
                  <p className="text-sm opacity-70 mt-0.5">
                    {formatPrice(i.price, lang)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(i.productId)}
                  className="text-red-400 hover:text-red-300 text-xs shrink-0"
                  aria-label={dict.cart.remove}
                >
                  {dict.cart.remove}
                </button>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center rounded-lg border border-[rgb(var(--border))] overflow-hidden">
                  <button
                    type="button"
                    className="px-3 py-1.5"
                    onClick={() => setQty(i.productId, i.quantity - 1)}
                    aria-label="-"
                  >
                    −
                  </button>
                  <span className="px-4 min-w-10 text-center" aria-live="polite">
                    {i.quantity}
                  </span>
                  <button
                    type="button"
                    className="px-3 py-1.5"
                    onClick={() => setQty(i.productId, i.quantity + 1)}
                    aria-label="+"
                  >
                    +
                  </button>
                </div>
                <div className="text-end">
                  <span className="block text-xs opacity-70">{dict.cart.subtotal}</span>
                  <strong className="text-base">
                    {formatPrice(i.price * i.quantity, lang)}
                  </strong>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* md+ : table */}
      <div className="hidden md:block card neon-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/20">
            <tr className="text-left">
              <th className="p-3">{dict.cart.product}</th>
              <th className="p-3 text-end">{dict.cart.price}</th>
              <th className="p-3 text-center">{dict.cart.qty}</th>
              <th className="p-3 text-end">{dict.cart.subtotal}</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => {
              const name = lang === "ar" && i.nameAr ? i.nameAr : i.name;
              return (
                <tr key={i.productId} className="border-t border-[rgb(var(--border))]">
                  <td className="p-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-black/30 overflow-hidden grid place-items-center">
                      {i.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={i.image} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">💨</span>
                      )}
                    </div>
                    <span className="font-medium">{name}</span>
                  </td>
                  <td className="p-3 text-end">{formatPrice(i.price, lang)}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center rounded-lg border border-[rgb(var(--border))] overflow-hidden w-fit mx-auto">
                      <button
                        type="button"
                        className="px-2 py-1"
                        onClick={() => setQty(i.productId, i.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="px-3 min-w-8 text-center">{i.quantity}</span>
                      <button
                        type="button"
                        className="px-2 py-1"
                        onClick={() => setQty(i.productId, i.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-end font-medium">
                    {formatPrice(i.price * i.quantity, lang)}
                  </td>
                  <td className="p-3 text-end">
                    <button
                      type="button"
                      onClick={() => remove(i.productId)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      {dict.cart.remove}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link href="/products" className="btn-ghost w-full sm:w-auto">
          {dict.cart.continue}
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="text-lg">
            <span className="opacity-70 me-2">{dict.cart.total}:</span>
            <strong className="text-xl">{formatPrice(total, lang)}</strong>
          </div>
          <Link href="/checkout" className="btn-primary w-full sm:w-auto">
            {dict.cart.checkout}
          </Link>
        </div>
      </div>
    </div>
  );
}
