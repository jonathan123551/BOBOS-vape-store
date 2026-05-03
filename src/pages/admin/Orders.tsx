import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  deleteOrder,
  listOrders,
  updateOrderStatus,
  type AdminOrder,
  type OrderStatus,
} from "@/lib/admin";
import { useLang } from "@/contexts/LangContext";
import { formatDate, formatPrice } from "@/lib/format";

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  OUT_FOR_DELIVERY: "Out for delivery",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "bg-amber-500/15 border-amber-500/40 text-amber-200",
  OUT_FOR_DELIVERY: "bg-cyan-500/15 border-cyan-500/40 text-cyan-200",
  DONE: "bg-emerald-500/15 border-emerald-500/40 text-emerald-200",
  CANCELLED: "bg-red-500/15 border-red-500/40 text-red-200",
};

export function AdminOrders() {
  const { lang } = useLang();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    listOrders()
      .then(setOrders)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load orders"),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    let list = orders;
    if (filter !== "ALL") list = list.filter((o) => o.status === filter);
    if (search.trim()) {
      const needle = search.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(needle) ||
          o.customerName.toLowerCase().includes(needle) ||
          o.phone.toLowerCase().includes(needle),
      );
    }
    return list;
  }, [orders, filter, search]);

  async function handleStatus(id: string, status: OrderStatus) {
    try {
      await updateOrderStatus(id, status);
      toast.success("Status updated");
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    try {
      await deleteOrder(id);
      toast.success("Order deleted");
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold glow-text">Orders</h1>
        <p className="text-sm opacity-70 mt-1">
          Manage order status and review customer details.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex flex-wrap gap-2">
          {(["ALL", "PENDING", "OUT_FOR_DELIVERY", "DONE", "CANCELLED"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`pill ${filter === s ? "pill-accent" : ""}`}
            >
              {s === "ALL" ? "All" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search by id, name, or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input h-9 py-0 sm:max-w-xs sm:ms-auto"
        />
      </div>

      {error && (
        <div className="card border border-red-500/40 bg-red-500/10 text-red-200 text-sm p-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="opacity-70 py-10 text-center">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="card neon-border p-10 text-center opacity-70">
          No orders match.
        </div>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <ul className="md:hidden space-y-3">
            {filtered.map((o) => (
              <li key={o.id} className="card neon-border p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{o.customerName}</p>
                    <p className="text-xs opacity-70 break-all" dir="ltr">
                      {o.id.slice(0, 8)}…
                    </p>
                  </div>
                  <span className={`pill border ${STATUS_BADGE[o.status]}`}>
                    {STATUS_LABEL[o.status]}
                  </span>
                </div>
                <div className="text-xs opacity-80 grid grid-cols-2 gap-1">
                  <span className="opacity-60">Phone</span>
                  <span dir="ltr" className="text-end">
                    {o.phone}
                  </span>
                  <span className="opacity-60">Total</span>
                  <span className="text-end font-semibold">
                    {formatPrice(o.total, lang)}
                  </span>
                  <span className="opacity-60">Created</span>
                  <span className="text-end" dir="ltr">
                    {formatDate(o.createdAt, lang)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedId((cur) => (cur === o.id ? null : o.id))}
                  className="text-xs underline opacity-80"
                >
                  {expandedId === o.id ? "Hide" : "Show"} items + address
                </button>
                {expandedId === o.id && (
                  <div className="text-xs space-y-2 pt-2 border-t border-[rgb(var(--border))]">
                    <p>
                      <strong className="opacity-70">Address:</strong>{" "}
                      {o.address}
                    </p>
                    {o.notes && (
                      <p>
                        <strong className="opacity-70">Notes:</strong> {o.notes}
                      </p>
                    )}
                    <ul className="space-y-1">
                      {o.items.map((it) => (
                        <li key={it.id} className="flex justify-between gap-2">
                          <span>
                            {it.name}{" "}
                            <span className="opacity-60">× {it.quantity}</span>
                          </span>
                          <span>{formatPrice(it.price * it.quantity, lang)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-2">
                  <select
                    value={o.status}
                    onChange={(e) => handleStatus(o.id, e.target.value as OrderStatus)}
                    className="input h-9 py-0 text-xs flex-1 min-w-32"
                  >
                    {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleDelete(o.id)}
                    className="btn-ghost h-9 px-3 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* md+ : table */}
          <div className="hidden md:block card neon-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[760px]">
                <thead className="bg-black/20 text-left">
                  <tr>
                    <th className="p-3">Order</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3 text-end">Total</th>
                    <th className="p-3">Created</th>
                    <th className="p-3">Status</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} className="border-t border-[rgb(var(--border))] align-top">
                      <td className="p-3 font-mono text-xs" dir="ltr">
                        {o.id.slice(0, 8)}…
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          className="font-medium hover:text-brand-400 text-start"
                          onClick={() =>
                            setExpandedId((cur) => (cur === o.id ? null : o.id))
                          }
                        >
                          {o.customerName}
                        </button>
                        {expandedId === o.id && (
                          <div className="mt-2 text-xs space-y-1 max-w-md">
                            <p className="opacity-70">{o.address}</p>
                            {o.notes && <p className="opacity-70">Notes: {o.notes}</p>}
                            <ul>
                              {o.items.map((it) => (
                                <li key={it.id}>
                                  {it.name} × {it.quantity} —{" "}
                                  {formatPrice(it.price * it.quantity, lang)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-mono text-xs" dir="ltr">
                        {o.phone}
                      </td>
                      <td className="p-3 text-end font-semibold">
                        {formatPrice(o.total, lang)}
                      </td>
                      <td className="p-3 text-xs opacity-70" dir="ltr">
                        {formatDate(o.createdAt, lang)}
                      </td>
                      <td className="p-3">
                        <select
                          value={o.status}
                          onChange={(e) =>
                            handleStatus(o.id, e.target.value as OrderStatus)
                          }
                          className="input h-9 py-0 text-xs"
                        >
                          {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 text-end">
                        <button
                          type="button"
                          onClick={() => handleDelete(o.id)}
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
    </div>
  );
}
