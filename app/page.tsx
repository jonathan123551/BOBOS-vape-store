import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { CategoryGrid } from "@/components/storefront/CategoryGrid";
import { HomeHero } from "@/components/storefront/HomeHero";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true },
      include: { category: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <HomeHero />
      <section className="container-page py-12">
        <CategoryGrid categories={categories} />
      </section>
      <section className="container-page pb-16">
        <ProductGrid products={featured} sectionKey="featured" />
        <div className="text-center mt-8">
          <Link href="/products" className="btn-ghost">
            ➜
          </Link>
        </div>
      </section>
    </div>
  );
}
