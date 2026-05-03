/**
 * Data layer that abstracts where products/categories come from.
 *
 * - When Supabase is configured, queries go to the live `products` /
 *   `categories` tables (read-only via the anon key + RLS policies in
 *   `supabase/migrations/`).
 * - Otherwise, the static seed in `seed.ts` is returned synchronously
 *   (wrapped in a Promise so callers don't branch on the data source).
 */
import { isSupabaseConfigured, supabase } from "./supabase";
import { seedCategories, seedProducts, type SeedCategory, type SeedProduct } from "./seed";

export interface Category {
  id: string;
  slug: string;
  name: string;
  nameAr: string | null;
  productCount?: number;
}

export interface Product {
  id: string;
  name: string;
  nameAr: string | null;
  description: string;
  descriptionAr: string | null;
  price: number;
  stock: number;
  image: string | null;
  flavor: string | null;
  nicotine: string | null;
  featured: boolean;
  categorySlug: string;
  category?: { name: string; nameAr: string | null } | null;
  createdAt: string;
}

interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  name_ar: string | null;
  products?: { count: number }[] | null;
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
  categories: { slug: string; name: string; name_ar: string | null } | null;
}

function fromSeedCategory(c: SeedCategory, productCount?: number): Category {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    nameAr: c.nameAr,
    productCount,
  };
}

function fromSeedProduct(p: SeedProduct): Product {
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

function mapProductRow(p: ProductRow): Product {
  return {
    id: p.id,
    name: p.name,
    nameAr: p.name_ar,
    description: p.description,
    descriptionAr: p.description_ar,
    price: p.price,
    stock: p.stock,
    image: p.image,
    flavor: p.flavor,
    nicotine: p.nicotine,
    featured: p.featured,
    categorySlug: p.categories?.slug ?? "",
    category: p.categories
      ? { name: p.categories.name, nameAr: p.categories.name_ar }
      : null,
    createdAt: p.created_at,
  };
}

export async function listCategories(): Promise<Category[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name, name_ar, products(count)")
      .order("name");
    if (error) throw error;
    const rows = (data ?? []) as unknown as CategoryRow[];
    return rows.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      nameAr: c.name_ar,
      productCount: c.products?.[0]?.count ?? 0,
    }));
  }
  return seedCategories.map((c) =>
    fromSeedCategory(c, seedProducts.filter((p) => p.categorySlug === c.slug).length),
  );
}

export async function listProducts(opts?: { featured?: boolean }): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase
      .from("products")
      .select(
        "id, name, name_ar, description, description_ar, price, stock, image, flavor, nicotine, featured, category_id, created_at, categories(slug, name, name_ar)",
      )
      .order("created_at", { ascending: false });
    if (opts?.featured) query = query.eq("featured", true);
    const { data, error } = await query;
    if (error) throw error;
    const rows = (data ?? []) as unknown as ProductRow[];
    return rows.map(mapProductRow);
  }
  const list = opts?.featured ? seedProducts.filter((p) => p.featured) : seedProducts;
  return list.map(fromSeedProduct);
}

export async function getProduct(id: string): Promise<Product | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, name_ar, description, description_ar, price, stock, image, flavor, nicotine, featured, category_id, created_at, categories(slug, name, name_ar)",
      )
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return mapProductRow(data as unknown as ProductRow);
  }
  const found = seedProducts.find((p) => p.id === id);
  return found ? fromSeedProduct(found) : null;
}
