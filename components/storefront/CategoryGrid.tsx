"use client";

import Link from "next/link";
import { useLang } from "../LangContext";

interface CatItem {
  id: string;
  slug: string;
  name: string;
  nameAr?: string | null;
  image?: string | null;
  _count?: { products: number };
}

export function CategoryGrid({ categories }: { categories: CatItem[] }) {
  const { dict, lang } = useLang();
  if (!categories.length) return null;
  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold glow-text">{dict.home.categories}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((c) => {
          const name = lang === "ar" && c.nameAr ? c.nameAr : c.name;
          return (
            <Link
              key={c.id}
              href={`/products?category=${encodeURIComponent(c.slug)}`}
              className="card neon-border group relative overflow-hidden aspect-[4/3] grid place-items-center"
            >
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.image}
                  alt={name}
                  className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:opacity-80 transition"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70" />
              <div className="relative text-center p-4">
                <div className="font-bold text-lg glow-text">{name}</div>
                {typeof c._count?.products === "number" && (
                  <div className="text-xs opacity-80 mt-1">{c._count.products}</div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
