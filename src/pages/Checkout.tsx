import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "@/contexts/CartContext";
import { useLang } from "@/contexts/LangContext";
import { formatPrice } from "@/lib/format";
import { createOrder } from "@/lib/orders";

export function Checkout() {
  const { items, total, clear, hydrated } = useCart();
  const { dict, lang } = useLang();
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) return;
    const fd = new FormData(e.currentTarget);
    const customerName = String(fd.get("customerName") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const address = String(fd.get("address") || "").trim();
    const notes = String(fd.get("notes") || "").trim() || undefined;
    if (!customerName || !phone || !address) {
      toast.error("Please fill in name, phone and address.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createOrder({ customerName, phone, address, notes, items });
      toast.success(dict.checkout.success);
      setOrderId(result.id);
      clear();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return <div className="container-page py-10 opacity-70">{dict.common.loading}</div>;
  }

  if (orderId) {
    return (
      <div className="container-page py-10">
        <div className="card neon-border p-8 text-center max-w-md mx-auto space-y-3">
          <div className="text-5xl">🎉</div>
          <h1 className="text-2xl font-bold glow-text">{dict.checkout.success}</h1>
          <p className="opacity-80">{dict.checkout.successDesc}</p>
          <p className="text-sm opacity-70">
            {dict.checkout.orderId}: <code className="font-mono">{orderId}</code>
          </p>
          <Link to="/" className="btn-primary inline-flex mt-2">
            {dict.checkout.backHome}
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-10">
        <div className="card neon-border p-8 text-center max-w-md mx-auto space-y-3">
          <h1 className="text-2xl font-bold">{dict.cart.empty}</h1>
          <Link to="/products" className="btn-primary inline-flex">
            {dict.cart.continue}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="grid lg:grid-cols-3 gap-8">
        <form onSubmit={onSubmit} className="lg:col-span-2 space-y-4">
          <h1 className="text-3xl font-bold glow-text">{dict.checkout.title}</h1>
          <div className="card neon-border p-6 space-y-3">
            <label className="block">
              <span className="text-sm opacity-80">{dict.checkout.name}</span>
              <input name="customerName" required className="input mt-1" autoComplete="name" />
            </label>
            <label className="block">
              <span className="text-sm opacity-80">{dict.checkout.phone}</span>
              <input
                name="phone"
                required
                type="tel"
                className="input mt-1"
                autoComplete="tel"
                dir="ltr"
                placeholder="01XXXXXXXXX"
              />
            </label>
            <label className="block">
              <span className="text-sm opacity-80">{dict.checkout.address}</span>
              <textarea name="address" required className="input mt-1 min-h-24" rows={3} />
            </label>
            <label className="block">
              <span className="text-sm opacity-80">{dict.checkout.notes}</span>
              <textarea name="notes" className="input mt-1" rows={2} />
            </label>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? dict.checkout.placing : dict.checkout.placeOrder}
            </button>
          </div>
        </form>

        <aside className="card neon-border p-6 h-fit space-y-4">
          <h2 className="font-semibold text-lg">{dict.cart.title}</h2>
          <ul className="divide-y divide-[rgb(var(--border))]">
            {items.map((i) => {
              const name = lang === "ar" && i.nameAr ? i.nameAr : i.name;
              return (
                <li key={i.productId} className="py-2 flex justify-between gap-2 text-sm">
                  <span>
                    {name} <span className="opacity-60">× {i.quantity}</span>
                  </span>
                  <span>{formatPrice(i.price * i.quantity, lang)}</span>
                </li>
              );
            })}
          </ul>
          <div className="flex justify-between text-base pt-3 border-t border-[rgb(var(--border))]">
            <span className="opacity-70">{dict.cart.total}</span>
            <strong>{formatPrice(total, lang)}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
}
