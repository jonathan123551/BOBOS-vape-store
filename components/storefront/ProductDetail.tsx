"use client";

import { useState } from "react";
import { useLang } from "../LangContext";
import { useCart } from "../CartContext";
import { formatPrice } from "@/lib/format";

interface PD {
  id: string;
  name: string;
  nameAr?: string | null;
  description: string;
  descriptionAr?: string | null;
  price: number;
  stock: number;
  image?: string | null;
  flavor?: string | null;
  nicotine?: string | null;
  category?: { name: string; nameAr?: string | null } | null;
}

export function ProductDetail({ product }: { product: PD }) {
  const { lang, dict } = useLang();
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  const name = lang === "ar" && product.nameAr ? product.nameAr : product.name;
  const desc = lang === "ar" && product.descriptionAr ? product.descriptionAr : product.description;
  const cat =
    product.category && (lang === "ar" && product.category.nameAr ? product.category.nameAr : product.category.name);

  const inStock = product.stock > 0;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="card neon-border overflow-hidden aspect-square bg-black/40">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full grid place-items-center text-6xl">💨</div>
        )}
      </div>
      <div className="space-y-4">
        {cat && <span className="pill-accent">{cat}</span>}
        <h1 className="text-3xl md:text-4xl font-bold glow-text">{name}</h1>
        <div className="text-2xl font-bold">{formatPrice(product.price, lang)}</div>
        <p className="opacity-80 leading-relaxed whitespace-pre-line">{desc}</p>
        <div className="flex flex-wrap gap-2 text-sm">
          {product.flavor && (
            <span className="pill">
              <strong className="opacity-60 me-1">{dict.products.flavor}:</strong> {product.flavor}
            </span>
          )}
          {product.nicotine && (
            <span className="pill">
              <strong className="opacity-60 me-1">{dict.products.nicotine}:</strong> {product.nicotine}
            </span>
          )}
          <span className={`pill ${inStock ? "" : "opacity-60"}`}>
            {inStock ? `${dict.products.stock}: ${product.stock}` : dict.products.outOfStock}
          </span>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <div className="flex items-center rounded-xl border border-[rgb(var(--border))] overflow-hidden">
            <button
              type="button"
              className="px-3 py-2 text-lg"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="decrease"
            >
              −
            </button>
            <span className="px-4 min-w-10 text-center">{qty}</span>
            <button
              type="button"
              className="px-3 py-2 text-lg"
              onClick={() => setQty((q) => Math.min(product.stock || q + 1, q + 1))}
              aria-label="increase"
            >
              +
            </button>
          </div>
          <button
            type="button"
            disabled={!inStock}
            onClick={() =>
              add(
                {
                  productId: product.id,
                  name: product.name,
                  nameAr: product.nameAr ?? null,
                  price: product.price,
                  image: product.image ?? null,
                },
                qty,
              )
            }
            className="btn-primary"
          >
            {inStock ? dict.products.addToCart : dict.products.outOfStock}
          </button>
        </div>
      </div>
    </div>
  );
}
