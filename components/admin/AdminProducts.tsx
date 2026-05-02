"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ImageUploader } from "./ImageUploader";

interface Category {
  id: string;
  slug: string;
  name: string;
  nameAr?: string | null;
}

interface Product {
  id: string;
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
  categoryId: string;
  category?: Category | null;
}

const empty = (): Partial<Product> => ({
  name: "",
  nameAr: "",
  description: "",
  descriptionAr: "",
  price: 0,
  stock: 0,
  image: null,
  flavor: "",
  nicotine: "",
  featured: false,
  categoryId: "",
});

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [pr, cr] = await Promise.all([
      fetch("/api/products", { cache: "no-store" }),
      fetch("/api/categories", { cache: "no-store" }),
    ]);
    if (pr.ok) setProducts(await pr.json());
    if (cr.ok) setCategories(await cr.json());
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const payload = {
      name: editing.name,
      nameAr: editing.nameAr || null,
      description: editing.description,
      descriptionAr: editing.descriptionAr || null,
      price: Number(editing.price),
      stock: Number(editing.stock),
      image: editing.image || null,
      flavor: editing.flavor || null,
      nicotine: editing.nicotine || null,
      featured: !!editing.featured,
      categoryId: editing.categoryId,
    };
    if (!payload.name || !payload.description || !payload.categoryId) {
      toast.error("Name, description and category are required");
      return;
    }
    const isNew = !editing.id;
    const res = await fetch(isNew ? "/api/products" : `/api/products/${editing.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Save failed");
      return;
    }
    toast.success(isNew ? "Product created" : "Product updated");
    setEditing(null);
    load();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Delete failed");
      return;
    }
    toast.success("Deleted");
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold glow-text">Products</h1>
          <p className="opacity-70 text-sm">Manage your storefront catalog.</p>
        </div>
        <button type="button" onClick={() => setEditing(empty())} className="btn-primary">
          + Add product
        </button>
      </div>

      {loading ? (
        <p className="opacity-70">Loading...</p>
      ) : products.length === 0 ? (
        <p className="opacity-70">No products yet.</p>
      ) : (
        <div className="card neon-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/20">
              <tr className="text-left">
                <th className="p-3">Image</th>
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-end">Price</th>
                <th className="p-3 text-end">Stock</th>
                <th className="p-3">Featured</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-[rgb(var(--border))]">
                  <td className="p-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/30 grid place-items-center">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg">💨</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 opacity-80">{p.category?.name || "—"}</td>
                  <td className="p-3 text-end">{p.price}</td>
                  <td className="p-3 text-end">{p.stock}</td>
                  <td className="p-3">{p.featured ? "★" : ""}</td>
                  <td className="p-3 text-end whitespace-nowrap">
                    <button type="button" onClick={() => setEditing(p)} className="btn-ghost text-xs me-2">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(p.id)}
                      className="btn-ghost text-xs !text-rose-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={onSubmit} className="card neon-border w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold glow-text">
              {editing.id ? "Edit product" : "Add product"}
            </h2>

            <div className="grid md:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm opacity-80">Name (EN)</span>
                <input
                  required
                  className="input mt-1"
                  value={editing.name ?? ""}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-sm opacity-80">Name (AR)</span>
                <input
                  className="input mt-1"
                  value={editing.nameAr ?? ""}
                  onChange={(e) => setEditing({ ...editing, nameAr: e.target.value })}
                  dir="rtl"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm opacity-80">Description (EN)</span>
              <textarea
                required
                className="input mt-1"
                rows={3}
                value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-sm opacity-80">Description (AR)</span>
              <textarea
                className="input mt-1"
                rows={3}
                value={editing.descriptionAr ?? ""}
                onChange={(e) => setEditing({ ...editing, descriptionAr: e.target.value })}
                dir="rtl"
              />
            </label>

            <div className="grid md:grid-cols-3 gap-3">
              <label className="block">
                <span className="text-sm opacity-80">Price</span>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  className="input mt-1"
                  value={editing.price ?? 0}
                  onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                />
              </label>
              <label className="block">
                <span className="text-sm opacity-80">Stock</span>
                <input
                  required
                  type="number"
                  min="0"
                  className="input mt-1"
                  value={editing.stock ?? 0}
                  onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })}
                />
              </label>
              <label className="block">
                <span className="text-sm opacity-80">Category</span>
                <select
                  required
                  className="input mt-1"
                  value={editing.categoryId ?? ""}
                  onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })}
                >
                  <option value="">— select —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm opacity-80">Flavor (optional)</span>
                <input
                  className="input mt-1"
                  value={editing.flavor ?? ""}
                  onChange={(e) => setEditing({ ...editing, flavor: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-sm opacity-80">Nicotine level (optional)</span>
                <input
                  className="input mt-1"
                  value={editing.nicotine ?? ""}
                  onChange={(e) => setEditing({ ...editing, nicotine: e.target.value })}
                  placeholder="e.g. 20 mg"
                />
              </label>
            </div>

            <div>
              <span className="text-sm opacity-80 block mb-1">Image</span>
              <ImageUploader
                value={editing.image ?? null}
                onChange={(url) => setEditing({ ...editing, image: url })}
              />
            </div>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!editing.featured}
                onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
              />
              Featured on homepage
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn-ghost">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
