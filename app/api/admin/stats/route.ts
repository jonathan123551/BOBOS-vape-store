import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromCookies } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Granularity = "daily" | "weekly" | "monthly";

function bucketKey(d: Date, g: Granularity): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  if (g === "monthly") return `${y}-${m}`;
  if (g === "weekly") {
    // ISO week-ish (UTC)
    const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const dayNum = (tmp.getUTCDay() + 6) % 7;
    tmp.setUTCDate(tmp.getUTCDate() - dayNum + 3);
    const firstThursday = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 4));
    const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
    firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
    const week = 1 + Math.round((tmp.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000));
    return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
  }
  return `${y}-${m}-${day}`;
}

export async function GET(req: NextRequest) {
  if (!getAdminFromCookies()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");
  const granularity = (searchParams.get("granularity") || "daily") as Granularity;

  const to = toStr ? new Date(toStr) : new Date();
  const from = fromStr
    ? new Date(fromStr)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const where = { createdAt: { gte: from, lte: to } };

  const [orders, items, byStatus] = await Promise.all([
    prisma.order.findMany({ where, select: { id: true, total: true, status: true, createdAt: true } }),
    prisma.orderItem.findMany({
      where: { order: where },
      include: { product: { include: { category: true } } },
    }),
    prisma.order.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
      _sum: { total: true },
    }),
  ]);

  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);

  const statusMap = {
    pending: 0,
    out_for_delivery: 0,
    done: 0,
    cancelled: 0,
  } as Record<string, number>;
  for (const s of byStatus) statusMap[s.status] = s._count._all;

  // Time series
  const seriesMap = new Map<string, { date: string; revenue: number; orders: number }>();
  for (const o of orders) {
    const key = bucketKey(o.createdAt, granularity);
    const existing = seriesMap.get(key) ?? { date: key, revenue: 0, orders: 0 };
    existing.orders += 1;
    if (o.status !== "cancelled") existing.revenue += o.total;
    seriesMap.set(key, existing);
  }
  const series = Array.from(seriesMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  // Top products & categories
  const productAgg = new Map<string, { id: string; name: string; quantity: number; revenue: number }>();
  const categoryAgg = new Map<string, { id: string; name: string; quantity: number; revenue: number }>();
  for (const it of items) {
    const p = productAgg.get(it.productId) ?? {
      id: it.productId,
      name: it.product?.name ?? it.name,
      quantity: 0,
      revenue: 0,
    };
    p.quantity += it.quantity;
    p.revenue += it.price * it.quantity;
    productAgg.set(it.productId, p);

    if (it.product?.category) {
      const c = categoryAgg.get(it.product.category.id) ?? {
        id: it.product.category.id,
        name: it.product.category.name,
        quantity: 0,
        revenue: 0,
      };
      c.quantity += it.quantity;
      c.revenue += it.price * it.quantity;
      categoryAgg.set(it.product.category.id, c);
    }
  }
  const topProducts = Array.from(productAgg.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const topCategories = Array.from(categoryAgg.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return NextResponse.json({
    totalOrders,
    totalRevenue,
    statusCounts: statusMap,
    series,
    topProducts,
    topCategories,
    range: { from, to, granularity },
  });
}
