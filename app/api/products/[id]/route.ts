import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminFromCookies } from "@/lib/auth";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  nameAr: z.string().optional().nullable(),
  description: z.string().min(1).optional(),
  descriptionAr: z.string().optional().nullable(),
  price: z.coerce.number().nonnegative().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  image: z.string().optional().nullable(),
  flavor: z.string().optional().nullable(),
  nicotine: z.string().optional().nullable(),
  featured: z.coerce.boolean().optional(),
  categoryId: z.string().min(1).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getAdminFromCookies()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const json = await req.json();
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const product = await prisma.product.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(product);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!getAdminFromCookies()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
