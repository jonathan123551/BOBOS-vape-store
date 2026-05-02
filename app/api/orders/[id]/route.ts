import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminFromCookies } from "@/lib/auth";

export const dynamic = "force-dynamic";

const STATUSES = ["pending", "out_for_delivery", "done", "cancelled"] as const;

const updateSchema = z.object({
  status: z.enum(STATUSES),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!getAdminFromCookies()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getAdminFromCookies()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const json = await req.json();
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const order = await prisma.order.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
    include: { items: true },
  });
  return NextResponse.json(order);
}
