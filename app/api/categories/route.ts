import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminFromCookies } from "@/lib/auth";

export const dynamic = "force-dynamic";

function toSlug(input: string): string {
  return input
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || `cat-${Date.now()}`;
}

const schema = z.object({
  name: z.string().min(1),
  nameAr: z.string().optional().nullable(),
  slug: z.string().optional(),
  image: z.string().optional().nullable(),
});

export async function GET() {
  const cats = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(cats);
}

export async function POST(req: NextRequest) {
  if (!getAdminFromCookies()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const slug = parsed.data.slug?.trim() || toSlug(parsed.data.name);
  try {
    const cat = await prisma.category.create({ data: { ...parsed.data, slug } });
    return NextResponse.json(cat, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Slug or name already exists" }, { status: 409 });
  }
}
