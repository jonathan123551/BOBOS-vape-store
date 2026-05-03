import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { loadDashboardStats, type DashboardStats } from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import { useLang } from "@/contexts/LangContext";

const STATUS_COLORS = {
  PENDING: "#fbbf24",
  OUT_FOR_DELIVERY: "#22d3ee",
  DONE: "#10b981",
  CANCELLED: "#ef4444",
};

function StatCard({
  label,
  value,
  sublabel,
  tone = "default",
}: {
  label: string;
  value: string;
  sublabel?: string;
  tone?: "default" | "warning" | "info" | "success" | "danger";
}) {
  const ringClass = {
    default: "border-[rgb(var(--border))]",
    warning: "border-amber-500/40",
    info: "border-cyan-500/40",
    success: "border-emerald-500/40",
    danger: "border-red-500/40",
  }[tone];
  return (
    <div className={`card p-4 sm:p-5 border ${ringClass}`}>
      <p className="text-xs uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-2xl sm:text-3xl font-extrabold mt-1 glow-text">{value}</p>
      {sublabel && <p className="text-xs opacity-60 mt-1">{sublabel}</p>}
    </div>
  );
}

function todayMinusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function AdminDashboard() {
  const { lang } = useLang();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState(todayMinusDays(30));
  const [to, setTo] = useState(todayMinusDays(0));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadDashboardStats({
      from: new Date(`${from}T00:00:00Z`),
      to: new Date(`${to}T23:59:59Z`),
    })
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load stats");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold glow-text">Dashboard</h1>
          <p className="text-sm opacity-70 mt-1">
            Orders, revenue, and trends across the selected range.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="block">
            <span className="text-xs opacity-70 block">From</span>
            <input
              type="date"
              className="input h-9 py-0"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs opacity-70 block">To</span>
            <input
              type="date"
              className="input h-9 py-0"
              value={to}
              min={from}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="card border border-red-500/40 bg-red-500/10 text-red-200 text-sm p-4">
          {error}
        </div>
      )}

      {loading && !stats ? (
        <p className="opacity-70 py-10 text-center">Loading…</p>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard label="Total orders" value={String(stats.ordersCount)} />
            <StatCard
              label="Pending"
              value={String(stats.pendingCount)}
              tone="warning"
            />
            <StatCard
              label="Out for delivery"
              value={String(stats.outForDeliveryCount)}
              tone="info"
            />
            <StatCard
              label="Done"
              value={String(stats.doneCount)}
              tone="success"
            />
            <StatCard
              label="Revenue (DONE)"
              value={formatPrice(stats.revenue, lang)}
              sublabel="From completed orders"
              tone="success"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-4 sm:p-5">
              <h2 className="font-semibold mb-3">Daily revenue</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.daily}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" fontSize={11} stroke="currentColor" />
                    <YAxis fontSize={11} stroke="currentColor" />
                    <Tooltip
                      contentStyle={{
                        background: "rgb(17 17 24)",
                        border: "1px solid rgba(168, 85, 247, 0.4)",
                        borderRadius: 12,
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#22d3ee"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-4 sm:p-5">
              <h2 className="font-semibold mb-3">Order status mix</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Pending", value: stats.pendingCount, status: "PENDING" as const },
                      {
                        name: "Out",
                        value: stats.outForDeliveryCount,
                        status: "OUT_FOR_DELIVERY" as const,
                      },
                      { name: "Done", value: stats.doneCount, status: "DONE" as const },
                      {
                        name: "Cancelled",
                        value: stats.cancelledCount,
                        status: "CANCELLED" as const,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" fontSize={11} stroke="currentColor" />
                    <YAxis fontSize={11} stroke="currentColor" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "rgb(17 17 24)",
                        border: "1px solid rgba(168, 85, 247, 0.4)",
                        borderRadius: 12,
                      }}
                    />
                    <Bar dataKey="value">
                      {[
                        STATUS_COLORS.PENDING,
                        STATUS_COLORS.OUT_FOR_DELIVERY,
                        STATUS_COLORS.DONE,
                        STATUS_COLORS.CANCELLED,
                      ].map((c, i) => (
                        <Cell key={i} fill={c} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card p-4 sm:p-5">
            <h2 className="font-semibold mb-3">Top products</h2>
            {stats.topProducts.length === 0 ? (
              <p className="opacity-60 text-sm">No completed orders in range.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[420px]">
                  <thead className="text-left opacity-70">
                    <tr>
                      <th className="py-2">Product</th>
                      <th className="py-2 text-end">Quantity</th>
                      <th className="py-2 text-end">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topProducts.map((p, i) => (
                      <tr
                        key={i}
                        className="border-t border-[rgb(var(--border))]"
                      >
                        <td className="py-2">{p.name}</td>
                        <td className="py-2 text-end">{p.quantity}</td>
                        <td className="py-2 text-end">{formatPrice(p.revenue, lang)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
