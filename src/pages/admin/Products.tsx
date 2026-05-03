import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  createProduct,
  deleteProduct,
  listAdminProducts,
  updateProduct,
  type ProductInput,
} from "@/lib/admin";
import type { Product, Category } from "@/lib/products";
import { useLang } from "@/contexts/LangContext";
import { formatPrice } from "@/lib/format";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface FormState extends ProductInput {
  id?: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  nameAr: "",
  description: "",
  descriptionAr: "",
  price: 0,
  stock: 0,
  image: null,
  flavor: null,
  nicotine: null,
  featured: false,
  categoryId: null,
};

export function AdminProducts() {
  const { lang } = useLang();
  const { mode } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<FormState | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    listAdminProducts()
      .then(({ products, categories }) => {
        setProducts(products);
        setCategories(categories);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load products"),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const needle = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        (p.nameAr ?? "").toLowerCase().includes(needle) ||
        (p.flavor ?? "").toLowerCase().includes(needle),
    );
  }, [products, search]);

  function startCreate() {
    setEditing({ ...EMPTY_FORM });
  }

  function startEdit(p: Product) {
    const cat = categories.find((c) => c.slug === p.categorySlug) ?? null;
    setEditing({
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
      categoryId: cat?.id ?? null,
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setSubmitting(true);
    try {
      if (editing.id) {
        await updateProduct(editing.id, editing);
        toast.success("Product updated");
      } else {
        await createProduct(editing);
        toast.success("Product created");
      }
      setEditing(null);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold glow-text">Products</h1>
          <p className="text-sm opacity-70 mt-1">
            Manage the catalog. {mode === "demo" ? "Demo mode — changes won't persist." : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:items-center">
          <input
            type="search"
            placeholder="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input h-9 py-0 sm:w-56"
          />
          <button type="button" onClick={startCreate} className="btn-primary h-9 px-4 text-sm">
            + New product
          </button>
        </div>
      </div>

      {error && (
        <div className="card border border-red-500/40 bg-red-500/10 text-red-200 text-sm p-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="opacity-70 py-10 text-center">Loading…</p>
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="md:hidden space-y-3">
            {filtered.map((p) => (
              <li key={p.id} className="card neon-border p-4 flex gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-black/30 grid place-items-center shrink-0">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl opacity-60">💨</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{p.name}</p>
                  <p className="text-xs opacity-70 truncate">{p.category?.name ?? "—"}</p>
                  <div className="flex flex-wrap gap-2 text-xs mt-1">
                    <span className="pill">{formatPrice(p.price, lang)}</span>
                    <span className="pill">Stock: {p.stock}</span>
                    {p.featured && <span className="pill pill-accent">Featured</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(p)}
                    className="btn-ghost h-8 px-2 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="btn-ghost h-8 px-2 text-xs text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop table */}
          <div className="hidden md:block card neon-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[680px]">
                <thead className="bg-black/20 text-left">
                  <tr>
                    <th className="p-3"></th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-end">Price</th>
                    <th className="p-3 text-end">Stock</th>
                    <th className="p-3">Featured</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-[rgb(var(--border))] hover:bg-black/20"
                    >
                      <td className="p-3">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-black/30 grid place-items-center">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="opacity-60">💨</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3 opacity-80">{p.category?.name ?? "—"}</td>
                      <td className="p-3 text-end">{formatPrice(p.price, lang)}</td>
                      <td className="p-3 text-end">{p.stock}</td>
                      <td className="p-3">{p.featured ? "✓" : ""}</td>
                      <td className="p-3 text-end whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          className="text-xs underline opacity-80 me-3"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/70 px-0 sm:px-4 py-0 sm:py-8 overflow-y-auto">
          <div className="card neon-border w-full sm:max-w-2xl max-h-screen overflow-y-auto rounded-b-none sm:rounded-2xl">
            <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold">
                  {editing.id ? "Edit product" : "New product"}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="btn-ghost h-9 w-9 !p-0"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <ImageUploader
                value={editing.image ?? null}
                onChange={(url) => setEditing((s) => (s ? { ...s, image: url } : s))}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm opacity-80">Name (EN)</span>
                  <input
                    required
                    className="input mt-1"
                    value={editing.name}
                    onChange={(e) =>
                      setEditing((s) => (s ? { ...s, name: e.target.value } : s))
                    }
                  />
                </label>
                <label className="block">
                  <span className="text-sm opacity-80">Name (AR)</span>
                  <input
                    className="input mt-1"
                    value={editing.nameAr ?? ""}
                    onChange={(e) =>
                      setEditing((s) => (s ? { ...s, nameAr: e.target.value } : s))
                    }
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm opacity-80">Description (EN)</span>
                  <textarea
                    required
                    rows={3}
                    className="input mt-1"
                    value={editing.description}
                    onChange={(e) =>
                      setEditing((s) =>
                        s ? { ...s, description: e.target.value } : s,
                      )
                    }
                  />
                </label>
                <label className="block">
                  <span className="text-sm opacity-80">Description (AR)</span>
                  <textarea
                    rows={3}
                    className="input mt-1"
                    value={editing.descriptionAr ?? ""}
                    onChange={(e) =>
                      setEditing((s) =>
                        s ? { ...s, descriptionAr: e.target.value } : s,
                      )
                    }
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <label className="block">
                  <span className="text-sm opacity-80">Price</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    required
                    className="input mt-1"
                    value={editing.price}
                    onChange={(e) =>
                      setEditing((s) =>
                        s ? { ...s, price: Number(e.target.value) || 0 } : s,
                      )
                    }
                  />
                </label>
                <label className="block">
                  <span className="text-sm opacity-80">Stock</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    required
                    className="input mt-1"
                    value={editing.stock}
                    onChange={(e) =>
                      setEditing((s) =>
                        s ? { ...s, stock: Number(e.target.value) || 0 } : s,
                      )
                    }
                  />
                </label>
                <label className="block">
                  <span className="text-sm opacity-80">Flavor</span>
                  <input
                    className="input mt-1"
                    value={editing.flavor ?? ""}
                    onChange={(e) =>
                      setEditing((s) =>
                        s ? { ...s, flavor: e.target.value || null } : s,
                      )
                    }
                  />
                </label>
                <label className="block">
                  <span className="text-sm opacity-80">Nicotine</span>
                  <input
                    className="input mt-1"
                    value={editing.nicotine ?? ""}
                    onChange={(e) =>
                      setEditing((s) =>
                        s ? { ...s, nicotine: e.target.value || null } : s,
                      )
                    }
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm opacity-80">Category</span>
                  <select
                    required
                    className="input mt-1"
                    value={editing.categoryId ?? ""}
                    onChange={(e) =>
                      setEditing((s) =>
                        s ? { ...s, categoryId: e.target.value || null } : s,
                      )
                    }
                  >
                    <option value="" disabled>
                      Select category…
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 mt-7">
                  <input
                    type="checkbox"
                    checked={editing.featured}
                    onChange={(e) =>
                      setEditing((s) =>
                        s ? { ...s, featured: e.target.checked } : s,
                      )
                    }
                  />
                  <span className="text-sm">Featured on home page</span>
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="btn-ghost h-10 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary h-10 px-5"
                >
                  {submitting ? "Saving…" : editing.id ? "Save changes" : "Create product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
