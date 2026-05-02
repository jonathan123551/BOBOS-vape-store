import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminFromCookies } from "@/lib/auth";

export const dynamic = "force-dynamic";

const productSchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().optional().nullable(),
  description: z.string().min(1),
  descriptionAr: z.string().optional().nullable(),
  price: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().nonnegative().default(0),
  image: z.string().optional().nullable(),
  flavor: z.string().optional().nullable(),
  nicotine: z.string().optional().nullable(),
  featured: z.coerce.boolean().optional().default(false),
  categoryId: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const sort = searchParams.get("sort") ?? "newest";
  const q = searchParams.get("q");

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

  const where: Record<string, unknown> = {};
  if (category) where.category = { slug: category };
  if (featured === "true") where.featured = true;
  if (q) where.name = { contains: q };

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy,
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  if (!getAdminFromCookies()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await req.json();
  const parsed = productSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const product = await prisma.product.create({ data: parsed.data });
  return NextResponse.json(product, { status: 201 });
}
