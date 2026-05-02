import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductDetail } from "@/components/storefront/ProductDetail";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true },
  });
  if (!product) notFound();
  return (
    <div className="container-page py-10">
      <Link href="/products" className="text-sm opacity-70 hover:opacity-100">
        ← Products
      </Link>
      <div className="mt-4">
        <ProductDetail product={product} />
      </div>
    </div>
  );
}
