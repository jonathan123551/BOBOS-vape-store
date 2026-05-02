import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminFromCookies } from "@/lib/auth";

export const dynamic = "force-dynamic";

const itemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
});

const orderSchema = z.object({
  customerName: z.string().min(2),
  phone: z.string().min(7),
  address: z.string().min(5),
  notes: z.string().optional().nullable(),
  items: z.array(itemSchema).min(1),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = orderSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { customerName, phone, address, notes, items } = parsed.data;

  const ids = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: ids } } });
  if (products.length !== ids.length) {
    return NextResponse.json({ error: "One or more products are unavailable" }, { status: 400 });
  }
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));

  for (const i of items) {
    const p = byId[i.productId];
    if (!p) return NextResponse.json({ error: "Unknown product" }, { status: 400 });
    if (p.stock < i.quantity) {
      return NextResponse.json({ error: `Insufficient stock for ${p.name}` }, { status: 400 });
    }
  }

  const total = items.reduce((s, i) => s + byId[i.productId].price * i.quantity, 0);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        customerName,
        phone,
        address,
        notes: notes ?? null,
        total,
        status: "pending",
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            name: byId[i.productId].name,
            price: byId[i.productId].price,
            quantity: i.quantity,
          })),
        },
      },
      include: { items: true },
    });
    for (const i of items) {
      await tx.product.update({
        where: { id: i.productId },
        data: { stock: { decrement: i.quantity } },
      });
    }
    return created;
  });

  return NextResponse.json(order, { status: 201 });
}

export async function GET(req: NextRequest) {
  if (!getAdminFromCookies()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}
