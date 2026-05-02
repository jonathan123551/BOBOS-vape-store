import { prisma } from "@/lib/prisma";
import { ProductsBrowser } from "@/components/storefront/ProductsBrowser";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="container-page py-10">
      <ProductsBrowser
        initialProducts={products.map((p) => ({
          id: p.id,
          name: p.name,
          nameAr: p.nameAr,
          description: p.description,
          descriptionAr: p.descriptionAr,
          price: p.price,
          stock: p.stock,
          image: p.image,
          flavor: p.flavor,
          nicotine: p.nicotine,
          category: p.category ? { name: p.category.name, nameAr: p.category.nameAr } : null,
          categorySlug: p.category?.slug ?? "",
          createdAt: p.createdAt.toISOString(),
        }))}
        categories={categories.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          nameAr: c.nameAr,
        }))}
      />
    </div>
  );
}
