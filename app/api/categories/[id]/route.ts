import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminFromCookies } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(1).optional(),
  nameAr: z.string().optional().nullable(),
  slug: z.string().min(1).optional(),
  image: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getAdminFromCookies()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const cat = await prisma.category.update({ where: { id: params.id }, data: parsed.data });
    return NextResponse.json(cat);
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!getAdminFromCookies()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Block delete when category has products to avoid cascading data loss surprises.
  const count = await prisma.product.count({ where: { categoryId: params.id } });
  if (count > 0) {
    return NextResponse.json(
      { error: `Category has ${count} products. Move or delete them first.` },
      { status: 409 },
    );
  }
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
