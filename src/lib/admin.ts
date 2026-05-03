/**
 * Admin-only data layer.
 *
 * - Reads/mutates Supabase when configured, with RLS enforcing
 *   `auth.email() = 'admin@bobos.local'`.
 * - In demo mode (no Supabase), reads come from the static seed in
 *   `src/lib/seed.ts`; mutations no-op (the UI shows a "Demo mode" toast).
 */
import { isSupabaseConfigured, supabase } from "./supabase";
import { seedCategories, seedProducts, type SeedCategory, type SeedProduct } from "./seed";
import type { Product, Category } from "./products";

export type OrderStatus = "PENDING" | "OUT_FOR_DELIVERY" | "DONE" | "CANCELLED";

export interface AdminOrder {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  notes: string | null;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: AdminOrderItem[];
}

export interface AdminOrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderRow {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  notes: string | null;
  total: number;
  status: OrderStatus;
  created_at: string;
  order_items: {
    id: string;
    product_id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
}

interface ProductRow {
  id: string;
  name: string;
  name_ar: string | null;
  description: string;
  description_ar: string | null;
  price: number;
  stock: number;
  image: string | null;
  flavor: string | null;
  nicotine: string | null;
  featured: boolean;
  category_id: string | null;
  created_at: string;
}

interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  name_ar: string | null;
  created_at: string;
}

export class DemoModeError extends Error {
  constructor() {
    super("Demo mode — connect Supabase to persist changes.");
    this.name = "DemoModeError";
  }
}

function ensureSupabaseOrThrow() {
  if (!isSupabaseConfigured || !supabase) throw new DemoModeError();
  return supabase;
}

// ---------------------------------------------------------------------------
// Demo-mode seeded shapes
// ---------------------------------------------------------------------------
function seedToProduct(p: SeedProduct): Product {
  const cat = seedCategories.find((c) => c.slug === p.categorySlug) ?? null;
  return {
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
    featured: p.featured,
    categorySlug: p.categorySlug,
    category: cat ? { name: cat.name, nameAr: cat.nameAr } : null,
    createdAt: p.createdAt,
  };
}

function seedToCategory(c: SeedCategory): Category {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    nameAr: c.nameAr,
    productCount: seedProducts.filter((p) => p.categorySlug === c.slug).length,
  };
}

function rowToProduct(r: ProductRow, categories: Category[]): Product {
  const cat = categories.find((c) => c.id === r.category_id) ?? null;
  return {
    id: r.id,
    name: r.name,
    nameAr: r.name_ar,
    description: r.description,
    descriptionAr: r.description_ar,
    price: r.price,
    stock: r.stock,
    image: r.image,
    flavor: r.flavor,
    nicotine: r.nicotine,
    featured: r.featured,
    categorySlug: cat?.slug ?? "",
    category: cat ? { name: cat.name, nameAr: cat.nameAr } : null,
    createdAt: r.created_at,
  };
}

function rowToCategory(r: CategoryRow): Category {
  return { id: r.id, slug: r.slug, name: r.name, nameAr: r.name_ar };
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
export async function listOrders(): Promise<AdminOrder[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, customer_name, phone, address, notes, total, status, created_at, order_items(id, product_id, name, price, quantity)",
      )
      .order("created_at", { ascending: false });
    if (error) throw error;
    const rows = (data ?? []) as unknown as OrderRow[];
    return rows.map((r) => ({
      id: r.id,
      customerName: r.customer_name,
      phone: r.phone,
      address: r.address,
      notes: r.notes,
      total: r.total,
      status: r.status,
      createdAt: r.created_at,
      items: r.order_items.map((i) => ({
        id: i.id,
        productId: i.product_id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
    }));
  }
  // Demo mode: no orders to list.
  return [];
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const sb = ensureSupabaseOrThrow();
  const { error } = await sb.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteOrder(id: string): Promise<void> {
  const sb = ensureSupabaseOrThrow();
  const { error } = await sb.from("orders").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
export interface ProductInput {
  id?: string;
  name: string;
  nameAr?: string | null;
  description: string;
  descriptionAr?: string | null;
  price: number;
  stock: number;
  image?: string | null;
  flavor?: string | null;
  nicotine?: string | null;
  featured: boolean;
  categoryId: string | null;
}

export async function listAdminProducts(): Promise<{ products: Product[]; categories: Category[] }> {
  if (isSupabaseConfigured && supabase) {
    const [{ data: catsData, error: catsErr }, { data: prodsData, error: prodsErr }] = await Promise.all([
      supabase.from("categories").select("id, slug, name, name_ar, created_at").order("name"),
      supabase
        .from("products")
        .select(
          "id, name, name_ar, description, description_ar, price, stock, image, flavor, nicotine, featured, category_id, created_at",
        )
        .order("created_at", { ascending: false }),
    ]);
    if (catsErr) throw catsErr;
    if (prodsErr) throw prodsErr;
    const categories = ((catsData ?? []) as unknown as CategoryRow[]).map(rowToCategory);
    const products = ((prodsData ?? []) as unknown as ProductRow[]).map((r) =>
      rowToProduct(r, categories),
    );
    return { products, categories };
  }
  return {
    products: seedProducts.map(seedToProduct),
    categories: seedCategories.map(seedToCategory),
  };
}

export async function createProduct(input: ProductInput): Promise<void> {
  const sb = ensureSupabaseOrThrow();
  const { error } = await sb.from("products").insert({
    name: input.name,
    name_ar: input.nameAr ?? null,
    description: input.description,
    description_ar: input.descriptionAr ?? null,
    price: input.price,
    stock: input.stock,
    image: input.image ?? null,
    flavor: input.flavor ?? null,
    nicotine: input.nicotine ?? null,
    featured: input.featured,
    category_id: input.categoryId,
  });
  if (error) throw error;
}

export async function updateProduct(id: string, input: ProductInput): Promise<void> {
  const sb = ensureSupabaseOrThrow();
  const { error } = await sb
    .from("products")
    .update({
      name: input.name,
      name_ar: input.nameAr ?? null,
      description: input.description,
      description_ar: input.descriptionAr ?? null,
      price: input.price,
      stock: input.stock,
      image: input.image ?? null,
      flavor: input.flavor ?? null,
      nicotine: input.nicotine ?? null,
      featured: input.featured,
      category_id: input.categoryId,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const sb = ensureSupabaseOrThrow();
  const { error } = await sb.from("products").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export interface CategoryInput {
  id?: string;
  slug: string;
  name: string;
  nameAr?: string | null;
}

export async function listAdminCategories(): Promise<Category[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name, name_ar, created_at")
      .order("name");
    if (error) throw error;
    return ((data ?? []) as unknown as CategoryRow[]).map(rowToCategory);
  }
  return seedCategories.map(seedToCategory);
}

export async function createCategory(input: CategoryInput): Promise<void> {
  const sb = ensureSupabaseOrThrow();
  const { error } = await sb.from("categories").insert({
    slug: input.slug,
    name: input.name,
    name_ar: input.nameAr ?? null,
  });
  if (error) throw error;
}

export async function updateCategory(id: string, input: CategoryInput): Promise<void> {
  const sb = ensureSupabaseOrThrow();
  const { error } = await sb
    .from("categories")
    .update({
      slug: input.slug,
      name: input.name,
      name_ar: input.nameAr ?? null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  const sb = ensureSupabaseOrThrow();
  const { error } = await sb.from("categories").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Stats / dashboard
// ---------------------------------------------------------------------------
export interface DashboardStats {
  ordersCount: number;
  pendingCount: number;
  outForDeliveryCount: number;
  doneCount: number;
  cancelledCount: number;
  revenue: number;
  topProducts: { name: string; quantity: number; revenue: number }[];
  topCategories: { name: string; quantity: number; revenue: number }[];
  daily: { date: string; revenue: number; count: number }[];
}

export async function loadDashboardStats(opts?: {
  from?: Date;
  to?: Date;
}): Promise<DashboardStats> {
  if (!isSupabaseConfigured || !supabase) {
    // Demo: empty stats with zero values.
    return {
      ordersCount: 0,
      pendingCount: 0,
      outForDeliveryCount: 0,
      doneCount: 0,
      cancelledCount: 0,
      revenue: 0,
      topProducts: [],
      topCategories: [],
      daily: [],
    };
  }
  const sb = supabase;
  let q = sb
    .from("orders")
    .select(
      "id, status, total, created_at, order_items(name, price, quantity, product_id)",
    );
  if (opts?.from) q = q.gte("created_at", opts.from.toISOString());
  if (opts?.to) q = q.lte("created_at", opts.to.toISOString());
  const { data, error } = await q;
  if (error) throw error;
  const rows = (data ?? []) as unknown as OrderRow[];

  const stats: DashboardStats = {
    ordersCount: rows.length,
    pendingCount: 0,
    outForDeliveryCount: 0,
    doneCount: 0,
    cancelledCount: 0,
    revenue: 0,
    topProducts: [],
    topCategories: [],
    daily: [],
  };

  const dailyMap = new Map<string, { revenue: number; count: number }>();
  const productsMap = new Map<string, { name: string; quantity: number; revenue: number }>();

  for (const o of rows) {
    if (o.status === "PENDING") stats.pendingCount++;
    else if (o.status === "OUT_FOR_DELIVERY") stats.outForDeliveryCount++;
    else if (o.status === "DONE") {
      stats.doneCount++;
      stats.revenue += o.total;
    } else if (o.status === "CANCELLED") stats.cancelledCount++;

    const day = (o.created_at ?? "").slice(0, 10);
    const dEntry = dailyMap.get(day) ?? { revenue: 0, count: 0 };
    dEntry.count += 1;
    if (o.status === "DONE") dEntry.revenue += o.total;
    dailyMap.set(day, dEntry);

    for (const it of o.order_items ?? []) {
      const k = it.product_id;
      const pEntry = productsMap.get(k) ?? { name: it.name, quantity: 0, revenue: 0 };
      pEntry.quantity += it.quantity;
      pEntry.revenue += it.price * it.quantity;
      productsMap.set(k, pEntry);
    }
  }

  stats.daily = Array.from(dailyMap.entries())
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => a.date.localeCompare(b.date));
  stats.topProducts = Array.from(productsMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return stats;
}
