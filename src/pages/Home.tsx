import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";
import { Logo } from "@/components/Logo";
import { ProductCard } from "@/components/ProductCard";
import { listCategories, listProducts, type Category, type Product } from "@/lib/products";

export function Home() {
  const { dict, lang } = useLang();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listCategories(), listProducts({ featured: true })]).then(([cats, prods]) => {
      if (!cancelled) {
        setCategories(cats);
        setFeatured(prods.slice(0, 8));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-[rgb(var(--border))]">
        <div className="absolute inset-0 -z-10 bg-smoke-radial" />
        <div className="smoke-wisp -z-10" />
        <div className="container-page py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="pill-accent">BOBOS</span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight glow-text leading-tight">
              {dict.home.heroTitle}
            </h1>
            <p className="text-lg opacity-80 max-w-xl">{dict.home.heroSubtitle}</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary">
                {dict.home.shopNow}
              </Link>
              <Link to="/contact" className="btn-ghost">
                {dict.nav.contact}
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="card neon-border p-10 grid place-items-center aspect-[4/3] bg-gradient-to-br from-brand-700/20 to-cyan-500/10">
              <Logo size={160} withText={false} />
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-12 space-y-5">
        <h2 className="text-2xl md:text-3xl font-bold">{dict.home.categories}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c) => {
            const name = lang === "ar" && c.nameAr ? c.nameAr : c.name;
            return (
              <Link
                key={c.id}
                to={`/products?category=${encodeURIComponent(c.slug)}`}
                className="card neon-border p-6 text-center hover:-translate-y-0.5 transition"
              >
                <div className="text-3xl mb-1">💨</div>
                <h3 className="font-semibold">{name}</h3>
                {typeof c.productCount === "number" && (
                  <p className="text-xs opacity-60 mt-1">{c.productCount}</p>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-page pb-16 space-y-5">
        <h2 className="text-2xl md:text-3xl font-bold">{dict.home.featured}</h2>
        {featured.length === 0 ? (
          <p className="opacity-70">{dict.home.empty}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        <div className="text-center mt-4">
          <Link to="/products" className="btn-ghost">
            {dict.home.viewAll}
          </Link>
        </div>
      </section>
    </div>
  );
}
