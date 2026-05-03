import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";
import { ProductCard } from "@/components/ProductCard";
import { listCategories, listProducts, type Category, type Product } from "@/lib/products";

type Sort = "newest" | "price_asc" | "price_desc";

export function Products() {
  const { dict, lang } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get("category") ?? "";
  const [sort, setSort] = useState<Sort>("newest");
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([listProducts(), listCategories()]).then(([p, c]) => {
      if (!cancelled) {
        setProducts(p);
        setCategories(c);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function setCategory(slug: string) {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set("category", slug);
    else next.delete("category");
    setSearchParams(next, { replace: true });
  }

  const filtered = useMemo(() => {
    let list = products;
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
  }, [products, category, sort, q]);

  return (
    <div className="container-page py-10 space-y-6">
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

      {loading ? (
        <p className="opacity-70 py-10 text-center">{dict.common.loading}</p>
      ) : filtered.length === 0 ? (
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
