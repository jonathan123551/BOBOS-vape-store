"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  statusCounts: { pending: number; out_for_delivery: number; done: number; cancelled: number };
  series: { date: string; revenue: number; orders: number }[];
  topProducts: { id: string; name: string; quantity: number; revenue: number }[];
  topCategories: { id: string; name: string; quantity: number; revenue: number }[];
  range: { from: string; to: string; granularity: string };
}

type Granularity = "daily" | "weekly" | "monthly";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-EG", { maximumFractionDigits: 0 }).format(n) + " EGP";
}

function todayStr(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toISOString().slice(0, 10);
}

export function AdminDashboard() {
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const [from, setFrom] = useState<string>(todayStr(-30));
  const [to, setTo] = useState<string>(todayStr(0));
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        granularity,
        from: new Date(from).toISOString(),
        to: new Date(`${to}T23:59:59`).toISOString(),
      });
      const res = await fetch(`/api/admin/stats?${params.toString()}`, { cache: "no-store" });
      if (res.ok) setStats(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [granularity]);

  const cards = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "Total orders", value: stats.totalOrders, color: "from-brand-600 to-purple-500" },
      { label: "Revenue", value: formatCurrency(stats.totalRevenue), color: "from-cyan-500 to-emerald-500" },
      { label: "Pending", value: stats.statusCounts.pending, color: "from-amber-500 to-yellow-400" },
      { label: "Out for delivery", value: stats.statusCounts.out_for_delivery, color: "from-blue-500 to-indigo-500" },
      { label: "Done", value: stats.statusCounts.done, color: "from-emerald-500 to-teal-500" },
      { label: "Cancelled", value: stats.statusCounts.cancelled, color: "from-rose-500 to-red-500" },
    ];
  }, [stats]);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold glow-text">Dashboard</h1>
          <p className="opacity-70 text-sm">Live overview of your store performance.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs flex flex-col">
            <span className="opacity-60">From</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="input h-9"
            />
          </label>
          <label className="text-xs flex flex-col">
            <span className="opacity-60">To</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input h-9" />
          </label>
          <select
            value={granularity}
            onChange={(e) => setGranularity(e.target.value as Granularity)}
            className="input h-9 max-w-[140px]"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button type="button" onClick={load} disabled={loading} className="btn-primary h-9">
            {loading ? "..." : "Apply"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="card neon-border p-4 relative overflow-hidden">
            <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${c.color}`} />
            <div className="relative">
              <div className="text-xs opacity-60 uppercase tracking-wider">{c.label}</div>
              <div className="text-2xl font-bold mt-1">{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card neon-border p-4">
        <h2 className="font-semibold mb-3">Sales over time</h2>
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={stats?.series ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="date" stroke="rgba(148,163,184,0.7)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(148,163,184,0.7)" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "rgb(17 17 24)",
                  border: "1px solid rgba(168,85,247,0.4)",
                  borderRadius: 12,
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#a855f7" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="orders" stroke="#22d3ee" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card neon-border p-4">
          <h2 className="font-semibold mb-3">Top products</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={stats?.topProducts ?? []}>
                <XAxis dataKey="name" stroke="rgba(148,163,184,0.7)" tick={{ fontSize: 10 }} interval={0} />
                <YAxis stroke="rgba(148,163,184,0.7)" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "rgb(17 17 24)",
                    border: "1px solid rgba(168,85,247,0.4)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="revenue" fill="#a855f7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card neon-border p-4">
          <h2 className="font-semibold mb-3">Top categories</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={stats?.topCategories ?? []}>
                <XAxis dataKey="name" stroke="rgba(148,163,184,0.7)" tick={{ fontSize: 10 }} interval={0} />
                <YAxis stroke="rgba(148,163,184,0.7)" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "rgb(17 17 24)",
                    border: "1px solid rgba(168,85,247,0.4)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="revenue" fill="#22d3ee" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
