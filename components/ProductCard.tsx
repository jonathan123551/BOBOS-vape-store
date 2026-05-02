"use client";

import Link from "next/link";
import { useLang } from "./LangContext";
import { useCart } from "./CartContext";
import { formatPrice } from "@/lib/format";

export interface ProductCardProduct {
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

export function ProductCard({ product }: { product: ProductCardProduct }) {
  const { lang, dict } = useLang();
  const { add } = useCart();
  const name = lang === "ar" && product.nameAr ? product.nameAr : product.name;
  const inStock = product.stock > 0;

  return (
    <div className="card neon-border group overflow-hidden flex flex-col transition hover:-translate-y-0.5">
      <Link href={`/products/${product.id}`} className="block aspect-[4/3] overflow-hidden bg-black/40">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-3xl">💨</div>
        )}
      </Link>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link href={`/products/${product.id}`} className="font-semibold leading-tight hover:text-brand-400">
          {name}
        </Link>
        <div className="text-xs opacity-70 flex flex-wrap gap-2">
          {product.flavor && <span className="pill">{product.flavor}</span>}
          {product.nicotine && <span className="pill">{product.nicotine}</span>}
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="text-base font-bold glow-text">{formatPrice(product.price, lang)}</span>
          <button
            type="button"
            disabled={!inStock}
            onClick={() =>
              add({
                productId: product.id,
                name: product.name,
                nameAr: product.nameAr ?? null,
                price: product.price,
                image: product.image ?? null,
              })
            }
            className="btn-primary h-9 px-3 text-xs"
          >
            {inStock ? dict.products.addToCart : dict.products.outOfStock}
          </button>
        </div>
      </div>
    </div>
  );
}
