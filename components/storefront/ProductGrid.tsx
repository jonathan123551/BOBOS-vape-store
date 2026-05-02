"use client";

import { useLang } from "../LangContext";
import { ProductCard, type ProductCardProduct } from "../ProductCard";

interface ProductGridProps {
  products: ProductCardProduct[];
  sectionKey?: "featured" | "all";
}

export function ProductGrid({ products, sectionKey = "all" }: ProductGridProps) {
  const { dict } = useLang();
  return (
    <div>
      {sectionKey === "featured" && (
        <h2 className="text-2xl md:text-3xl font-bold glow-text mb-6">{dict.home.featured}</h2>
      )}
      {products.length === 0 ? (
        <p className="opacity-70">{dict.products.empty}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
