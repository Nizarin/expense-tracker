/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { paiseToRupees } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchDashboard,
  setDashboardMonth,
} from "@/store/slices/dashboardSlice";

/* ── SSR-safe Recharts imports ── */
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false },
);
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), {
  ssr: false,
});
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), {
  ssr: false,
});
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), {
  ssr: false,
});
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), {
  ssr: false,
});
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), {
  ssr: false,
});
const CartesianGrid = dynamic(
  () => import("recharts").then((m) => m.CartesianGrid),
  { ssr: false },
);
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), {
  ssr: false,
});
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), {
  ssr: false,
});

/* ── constants ── */
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const CAT_COLORS: Record<string, string> = {
  Food: "#f87171",
  Transport: "#34d399",
  Shopping: "#60a5fa",
  Bills: "#fbbf24",
  Health: "#f472b6",
  Entertainment: "#a78bfa",
  Investment: "#2dd4bf",
  Other: "#94a3b8",
};
function catColor(name: string, index: number) {
  const fallbacks = [
    "#f87171",
    "#60a5fa",
    "#fbbf24",
    "#34d399",
    "#a78bfa",
    "#f472b6",
    "#2dd4bf",
    "#94a3b8",
  ];
  return CAT_COLORS[name] ?? fallbacks[index % fallbacks.length];
}

/* ── custom tooltip ── */
function DarkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[rgba(15,15,25,.96)] px-3 py-2.5 text-[12px] shadow-xl">
      <p className="mb-1.5 text-[11px] text-white/40">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: ₹{Number(p.value).toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
}

function PieDarkTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-xl border border-white/10 bg-[rgba(15,15,25,.96)] px-3 py-2.5 text-[12px] shadow-xl">
      <p style={{ color: item.payload.fill }} className="font-medium">
        {item.name}
      </p>
      <p className="text-white/60">
        ₹{Number(item.value).toLocaleString("en-IN")}
      </p>
      <p className="text-white/35">
        {(item.payload.percent * 100).toFixed(1)}%
      </p>
    </div>
  );
}

/* ── custom legend ── */
function CustomLegend({ payload, data }: { payload?: any[]; data: any[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="mt-4 flex flex-col gap-2">
      {(payload ?? []).map((entry: any, i: number) => {
        const pct = total > 0 ? Math.round((data[i]?.value / total) * 100) : 0;
        return (
          <div
            key={entry.value}
            className="flex items-center justify-between rounded-[10px] border border-white/5 bg-white/3 px-3 py-2 transition-colors hover:bg-white/6"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: entry.color }}
              />
              <span className="text-[13px] text-white/70">{entry.value}</span>
              <span className="text-[11px] text-white/30">{pct}%</span>
            </div>
            <span
              className="text-[13px] font-medium"
              style={{ color: entry.color }}
            >
              ₹{Number(data[i]?.value).toLocaleString("en-IN")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── section card wrapper ── */
function SectionCard({
  dot,
  title,
  sub,
  badge,
  children,
}: {
  dot: string;
  title: string;
  sub?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-up rounded-2xl border border-white/7 bg-white/3 p-5">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="block h-1.5 w-1.5 rounded-full"
              style={{ background: dot, boxShadow: `0 0 6px ${dot}88` }}
            />
            <p className="text-[14px] font-medium text-white/50">{title}</p>
          </div>
          {sub && <p className="mt-1 text-[12px] text-white/25">{sub}</p>}
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="py-10 text-center">
      <p className="mb-2 text-[28px] opacity-30">{icon}</p>
      <p className="text-[13px] text-white/20">{text}</p>
    </div>
  );
}

/* ══════════════════════════════
   PAGE
   ══════════════════════════════ */
export default function InsightsPage() {
  const dispatch = useAppDispatch();
  const {
    summary,
    status,
    selectedMonth: month,
  } = useAppSelector((s) => s.dashboard);
  const loading = status === "loading" || status === "idle";

  useEffect(() => {
    dispatch(fetchDashboard(month));
  }, [dispatch, month]);

  const byCategory = summary?.expByCategory ?? [];
  const incomeTrend = summary?.incomeTrend ?? [];
  const expenseTrend = summary?.expenseTrend ?? [];

  const pieData = byCategory.map((c, i) => ({
    name: c._id,
    value: paiseToRupees(c.total),
    fill: catColor(c._id, i),
  }));

  /* merge income + expense trend by month key */
  const trendMap = new Map<
    string,
    { name: string; Income: number; Expense: number }
  >();
  incomeTrend.forEach((m) => {
    const key = `${m._id.year}-${m._id.month}`;
    const name = `${MONTH_NAMES[m._id.month - 1]} ${String(m._id.year).slice(2)}`;
    trendMap.set(key, { name, Income: paiseToRupees(m.total), Expense: 0 });
  });
  expenseTrend.forEach((m) => {
    const key = `${m._id.year}-${m._id.month}`;
    const name = `${MONTH_NAMES[m._id.month - 1]} ${String(m._id.year).slice(2)}`;
    const existing = trendMap.get(key);
    if (existing) existing.Expense = paiseToRupees(m.total);
    else
      trendMap.set(key, { name, Income: 0, Expense: paiseToRupees(m.total) });
  });
  const barData = Array.from(trendMap.values()).slice(-6);

  const totalSpend = summary?.totalExpense ?? 0;
  const totalIncome = summary?.totalIncome ?? 0;
  const netSaved = paiseToRupees(totalIncome - totalSpend);

  const topCat = byCategory[0];
  const topPct =
    totalSpend > 0 && topCat
      ? Math.round((topCat.total / totalSpend) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6 lg:px-8 2xl:max-w-4xl">
      {/* ── Header ── */}
      <div className="flex animate-fade-up items-center justify-between">
        <h1
          className="text-[26px] text-white"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Insights
        </h1>
        <input
          type="month"
          value={month}
          onChange={(e) => dispatch(setDashboardMonth(e.target.value))}
          className="cursor-pointer rounded-[10px] border border-white/8 bg-white/5 px-3 py-1.5 text-[12px] text-white outline-none transition focus:border-violet-500/35"
        />
      </div>

      {/* ── Mini stats ── */}
      <div className="animate-fade-up grid grid-cols-3 gap-3">
        {[
          {
            val: `₹${paiseToRupees(totalSpend).toLocaleString("en-IN")}`,
            label: "Total Spent",
            color: "text-red-400",
          },
          {
            val: `₹${paiseToRupees(totalIncome).toLocaleString("en-IN")}`,
            label: "Total Income",
            color: "text-emerald-400",
          },
          {
            val: `₹${netSaved.toLocaleString("en-IN")}`,
            label: "Net Saved",
            color: "text-violet-400",
          },
        ].map(({ val, label, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/7 bg-white/3 px-4 py-4"
          >
            <p className={`text-[17px] font-medium ${color}`}>{val}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[.6px] text-white/30">
              {label}
            </p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[260, 300].map((h) => (
            <div
              key={h}
              className="animate-pulse rounded-2xl border border-white/7 bg-white/3"
              style={{ height: h }}
            />
          ))}
        </div>
      ) : (
        <>
          {/* ── Pie — spending by category ── */}
          <SectionCard
            dot="#a78bfa"
            title="Spending by Category"
            sub={`${month} · ${byCategory.length} categories`}
            badge={
              topCat && (
                <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] font-medium text-red-400">
                  Top: {topCat._id} {topPct}%
                </span>
              )
            }
          >
            {pieData.length === 0 ? (
              <EmptyState icon="📊" text="No expense data for this month." />
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="mx-auto sm:mx-0">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={2}
                        strokeWidth={0}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieDarkTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1">
                  <CustomLegend data={pieData} />
                </div>
              </div>
            )}
          </SectionCard>

          {/* ── Bar — monthly expense trend ── */}
          <SectionCard
            dot="#60a5fa"
            title="Monthly Expense Trend"
            sub="Last 6 months"
          >
            {barData.length === 0 ? (
              <EmptyState icon="📈" text="Not enough data yet." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={barData}
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                  barGap={4}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    width={44}
                  />
                  <Tooltip
                    content={<DarkTooltip />}
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  />
                  <Bar
                    dataKey="Expense"
                    fill="#f87171"
                    fillOpacity={0.85}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          {/* ── Bar — income vs expense comparison ── */}
          <SectionCard
            dot="#34d399"
            title="Income vs Expenses"
            sub="Last 6 months comparison"
            badge={
              <div className="flex items-center gap-3 text-[11px] text-white/35">
                <span className="flex items-center gap-1.5">
                  <span className="block h-2.5 w-2.5 rounded-[3px] bg-emerald-400" />
                  Income
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="block h-2.5 w-2.5 rounded-[3px] bg-red-400" />
                  Expense
                </span>
              </div>
            }
          >
            {barData.length === 0 ? (
              <EmptyState icon="📉" text="Not enough data yet." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={barData}
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                  barGap={4}
                  barCategoryGap="25%"
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    width={44}
                  />
                  <Tooltip
                    content={<DarkTooltip />}
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.4)",
                      paddingTop: "12px",
                    }}
                  />
                  <Bar
                    dataKey="Income"
                    fill="#34d399"
                    fillOpacity={0.85}
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="Expense"
                    fill="#f87171"
                    fillOpacity={0.85}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
