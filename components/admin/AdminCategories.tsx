"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ImageUploader } from "./ImageUploader";

interface Category {
  id: string;
  slug: string;
  name: string;
  nameAr?: string | null;
  image?: string | null;
  _count?: { products: number };
}

const empty = (): Partial<Category> => ({ name: "", nameAr: "", slug: "", image: null });

export function AdminCategories() {
  const [items, setItems] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/categories", { cache: "no-store" });
    if (res.ok) setItems(await res.json());
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
      slug: editing.slug || undefined,
      image: editing.image || null,
    };
    if (!payload.name) {
      toast.error("Name is required");
      return;
    }
    const isNew = !editing.id;
    const res = await fetch(isNew ? "/api/categories" : `/api/categories/${editing.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Save failed");
      return;
    }
    toast.success(isNew ? "Category created" : "Category updated");
    setEditing(null);
    load();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error || "Delete failed");
      return;
    }
    toast.success("Deleted");
    setItems((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold glow-text">Categories</h1>
          <p className="opacity-70 text-sm">Organize products into categories.</p>
        </div>
        <button type="button" onClick={() => setEditing(empty())} className="btn-primary">
          + Add category
        </button>
      </div>

      {loading ? (
        <p className="opacity-70">Loading...</p>
      ) : items.length === 0 ? (
        <p className="opacity-70">No categories yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((c) => (
            <div key={c.id} className="card neon-border overflow-hidden">
              <div className="aspect-[16/9] bg-black/30 grid place-items-center">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">📦</span>
                )}
              </div>
              <div className="p-4 flex justify-between items-start gap-2">
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs opacity-60">{c.slug}</div>
                  {typeof c._count?.products === "number" && (
                    <div className="text-xs opacity-70 mt-1">{c._count.products} products</div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <button type="button" onClick={() => setEditing(c)} className="btn-ghost text-xs">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(c.id)}
                    className="btn-ghost text-xs !text-rose-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={onSubmit} className="card neon-border w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold glow-text">
              {editing.id ? "Edit category" : "Add category"}
            </h2>
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
                dir="rtl"
                value={editing.nameAr ?? ""}
                onChange={(e) => setEditing({ ...editing, nameAr: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-sm opacity-80">Slug (optional, auto-generated)</span>
              <input
                className="input mt-1 font-mono text-sm"
                value={editing.slug ?? ""}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                placeholder="e.g. disposable-vapes"
              />
            </label>
            <div>
              <span className="text-sm opacity-80 block mb-1">Image</span>
              <ImageUploader
                value={editing.image ?? null}
                onChange={(url) => setEditing({ ...editing, image: url })}
              />
            </div>
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
