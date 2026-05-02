"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLang } from "../LangContext";
import { ProductCard } from "../ProductCard";

interface PB_Product {
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
  category: { name: string; nameAr?: string | null } | null;
  categorySlug: string;
  createdAt: string;
}

interface PB_Category {
  id: string;
  slug: string;
  name: string;
  nameAr?: string | null;
}

interface Props {
  initialProducts: PB_Product[];
  categories: PB_Category[];
}

type Sort = "newest" | "price_asc" | "price_desc";

export function ProductsBrowser({ initialProducts, categories }: Props) {
  const { dict, lang } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState<string>(searchParams.get("category") ?? "");
  const [sort, setSort] = useState<Sort>("newest");
  const [q, setQ] = useState<string>("");

  // Sync URL when category changes (so deep links work).
  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    const qs = params.toString();
    router.replace(qs ? `/products?${qs}` : "/products", { scroll: false });
  }, [category, router]);

  const filtered = useMemo(() => {
    let list = initialProducts;
    if (category) list = list.filter((p) => p.categorySlug === category);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          (p.nameAr ?? "").toLowerCase().includes(needle) ||
          (p.flavor ?? "").toLowerCase().includes(needle),
      );
    }
    list = [...list];
    if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return list;
  }, [initialProducts, category, sort, q]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <h1 className="text-3xl md:text-4xl font-bold glow-text">{dict.products.title}</h1>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={dict.common.search}
          className="input max-w-xs"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("")}
            className={`pill ${category === "" ? "pill-accent" : ""}`}
          >
            {dict.products.all}
          </button>
          {categories.map((c) => {
            const name = lang === "ar" && c.nameAr ? c.nameAr : c.name;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.slug)}
                className={`pill ${category === c.slug ? "pill-accent" : ""}`}
              >
                {name}
              </button>
            );
          })}
        </div>
        <div className="ms-auto">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="input h-10 py-0 max-w-xs"
            aria-label={dict.products.sortBy}
          >
            <option value="newest">{dict.products.newest}</option>
            <option value="price_asc">{dict.products.priceAsc}</option>
            <option value="price_desc">{dict.products.priceDesc}</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="opacity-70 py-10 text-center">{dict.products.empty}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
