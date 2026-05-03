import { useCallback, useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  createCategory,
  deleteCategory,
  listAdminCategories,
  updateCategory,
  type CategoryInput,
} from "@/lib/admin";
import type { Category } from "@/lib/products";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const EMPTY_FORM: CategoryInput = { slug: "", name: "", nameAr: "" };

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminCategories() {
  const { mode } = useAdminAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<(CategoryInput & { id?: string }) | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    listAdminCategories()
      .then(setCategories)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load categories"),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function startCreate() {
    setEditing({ ...EMPTY_FORM });
  }

  function startEdit(c: Category) {
    setEditing({ id: c.id, slug: c.slug, name: c.name, nameAr: c.nameAr });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setSubmitting(true);
    try {
      if (editing.id) {
        await updateCategory(editing.id, editing);
        toast.success("Category updated");
      } else {
        await createCategory(editing);
        toast.success("Category created");
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
    if (!confirm("Delete this category? Products in it will become uncategorized.")) return;
    try {
      await deleteCategory(id);
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold glow-text">Categories</h1>
          <p className="text-sm opacity-70 mt-1">
            {mode === "demo" ? "Demo mode — changes won't persist." : "Group products by type."}
          </p>
        </div>
        <button type="button" onClick={startCreate} className="btn-primary h-9 px-4 text-sm">
          + New category
        </button>
      </div>

      {error && (
        <div className="card border border-red-500/40 bg-red-500/10 text-red-200 text-sm p-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="opacity-70 py-10 text-center">Loading…</p>
      ) : categories.length === 0 ? (
        <div className="card neon-border p-10 text-center opacity-70">No categories yet.</div>
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="md:hidden space-y-3">
            {categories.map((c) => (
              <li key={c.id} className="card neon-border p-4 space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    {c.nameAr && <p className="text-sm opacity-70" dir="rtl">{c.nameAr}</p>}
                  </div>
                  <span className="pill">{c.slug}</span>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    className="text-xs underline opacity-80"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="text-xs text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop table */}
          <div className="hidden md:block card neon-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-black/20 text-left">
                <tr>
                  <th className="p-3">Name (EN)</th>
                  <th className="p-3">Name (AR)</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-[rgb(var(--border))] hover:bg-black/20"
                  >
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3" dir="rtl">{c.nameAr ?? "—"}</td>
                    <td className="p-3 font-mono text-xs opacity-80">{c.slug}</td>
                    <td className="p-3 text-end whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        className="text-xs underline opacity-80 me-3"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
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
        </>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/70 px-0 sm:px-4 py-0 sm:py-8 overflow-y-auto">
          <div className="card neon-border w-full sm:max-w-md max-h-screen overflow-y-auto rounded-b-none sm:rounded-2xl">
            <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold">
                  {editing.id ? "Edit category" : "New category"}
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

              <label className="block">
                <span className="text-sm opacity-80">Name (EN)</span>
                <input
                  required
                  className="input mt-1"
                  value={editing.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setEditing((s) =>
                      s
                        ? {
                            ...s,
                            name,
                            slug: !s.id && (!s.slug || s.slug === slugify(s.name)) ? slugify(name) : s.slug,
                          }
                        : s,
                    );
                  }}
                />
              </label>

              <label className="block">
                <span className="text-sm opacity-80">Name (AR)</span>
                <input
                  className="input mt-1"
                  value={editing.nameAr ?? ""}
                  dir="rtl"
                  onChange={(e) =>
                    setEditing((s) => (s ? { ...s, nameAr: e.target.value } : s))
                  }
                />
              </label>

              <label className="block">
                <span className="text-sm opacity-80">Slug</span>
                <input
                  required
                  pattern="[a-z0-9\-]+"
                  className="input mt-1 font-mono text-sm"
                  dir="ltr"
                  value={editing.slug}
                  onChange={(e) =>
                    setEditing((s) => (s ? { ...s, slug: slugify(e.target.value) } : s))
                  }
                />
                <span className="text-xs opacity-60 block mt-1">
                  URL-friendly identifier (lowercase letters, digits, dashes).
                </span>
              </label>

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
                  {submitting ? "Saving…" : editing.id ? "Save changes" : "Create category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
