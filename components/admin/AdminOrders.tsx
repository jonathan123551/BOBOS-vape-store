"use client";

import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  notes?: string | null;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const STATUSES = [
  { v: "pending", label: "Pending", color: "bg-amber-600/20 text-amber-300" },
  { v: "out_for_delivery", label: "Out for delivery", color: "bg-blue-600/20 text-blue-300" },
  { v: "done", label: "Done", color: "bg-emerald-600/20 text-emerald-300" },
  { v: "cancelled", label: "Cancelled", color: "bg-rose-600/20 text-rose-300" },
];

function statusStyle(s: string) {
  return STATUSES.find((x) => x.v === s)?.color || "bg-zinc-600/20 text-zinc-300";
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-EG", { maximumFractionDigits: 0 }).format(n) + " EGP";
}

function formatDate(s: string) {
  return new Date(s).toLocaleString();
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const url = filter ? `/api/orders?status=${filter}` : "/api/orders";
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) setOrders(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error("Update failed");
      return;
    }
    toast.success("Status updated");
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold glow-text">Orders</h1>
          <p className="opacity-70 text-sm">Manage customer orders and update delivery status.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("")}
            className={`pill ${filter === "" ? "pill-accent" : ""}`}
          >
            All
          </button>
          {STATUSES.map((s) => (
            <button
              key={s.v}
              type="button"
              onClick={() => setFilter(s.v)}
              className={`pill ${filter === s.v ? "pill-accent" : ""}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="opacity-70">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="opacity-70">No orders yet.</p>
      ) : (
        <div className="card neon-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/20">
              <tr className="text-left">
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <Fragment key={o.id}>
                  <tr className="border-t border-[rgb(var(--border))]">
                    <td className="p-3 font-mono text-xs">{o.id.slice(-8)}</td>
                    <td className="p-3">
                      <div className="font-medium">{o.customerName}</div>
                      <div className="opacity-60 text-xs">{o.phone}</div>
                    </td>
                    <td className="p-3 font-medium">{formatCurrency(o.total)}</td>
                    <td className="p-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className={`text-xs rounded-full px-3 py-1 outline-none ${statusStyle(o.status)} border-0`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s.v} value={s.v}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-xs opacity-70">{formatDate(o.createdAt)}</td>
                    <td className="p-3 text-end">
                      <button
                        type="button"
                        onClick={() => setOpen(open === o.id ? null : o.id)}
                        className="btn-ghost text-xs"
                      >
                        {open === o.id ? "Hide" : "View"}
                      </button>
                    </td>
                  </tr>
                  {open === o.id && (
                    <tr className="border-t border-[rgb(var(--border))] bg-black/10">
                      <td colSpan={6} className="p-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-semibold mb-2">Delivery</h3>
                            <p className="text-sm whitespace-pre-line opacity-90">{o.address}</p>
                            {o.notes && (
                              <p className="text-xs opacity-70 mt-2">
                                <strong>Notes:</strong> {o.notes}
                              </p>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">Items</h3>
                            <ul className="text-sm space-y-1">
                              {o.items.map((it) => (
                                <li key={it.id} className="flex justify-between gap-3">
                                  <span>
                                    {it.name} <span className="opacity-60">× {it.quantity}</span>
                                  </span>
                                  <span>{formatCurrency(it.price * it.quantity)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
