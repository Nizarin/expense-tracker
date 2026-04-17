"use client";

import { useEffect, useCallback, useState } from "react";
import IncomeForm from "@/app/components/IncomeForm";
import { formatINR } from "@/lib/format";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchIncome,
  deleteIncome,
  setIncomeMonth,
} from "@/store/slices/incomeSlice";

const TYPE_STYLES: Record<
  string,
  { badge: string; icon: string; iconBg: string }
> = {
  Salary: {
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: "💵",
    iconBg: "bg-emerald-500/10 border-emerald-500/15",
  },
  Freelance: {
    badge: "bg-violet-500/10  text-violet-400  border-violet-500/20",
    icon: "💻",
    iconBg: "bg-violet-500/10  border-violet-500/15",
  },
  Bonus: {
    badge: "bg-amber-500/10   text-amber-400   border-amber-500/20",
    icon: "🎯",
    iconBg: "bg-amber-500/10   border-amber-500/15",
  },
  Profit: {
    badge: "bg-blue-500/10    text-blue-400    border-blue-500/20",
    icon: "📈",
    iconBg: "bg-blue-500/10    border-blue-500/15",
  },
  Other: {
    badge: "bg-white/[0.07]   text-white/50    border-white/10",
    icon: "💰",
    iconBg: "bg-white/[0.06]   border-white/10",
  },
};

function getStyle(type: string) {
  return TYPE_STYLES[type] ?? TYPE_STYLES.Other;
}

export default function IncomePage() {
  const dispatch = useAppDispatch();
  const { items: incomes, selectedMonth: month } = useAppSelector(
    (s) => s.income,
  );
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchIncomes = useCallback(() => {
    dispatch(fetchIncome(month));
  }, [dispatch, month]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  async function handleDelete(id: string) {
    setDeleting(id);
    await dispatch(deleteIncome(id));
    setDeleting(null);
  }

  const total = incomes.reduce((s, i) => s + i.amount, 0);

  /* summary by type */
  const byType = incomes.reduce<Record<string, number>>((acc, i) => {
    acc[i.type] = (acc[i.type] ?? 0) + i.amount;
    return acc;
  }, {});
  const summaryEntries = Object.entries(byType).sort((a, b) => b[1] - a[1]);

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6 lg:px-8 2xl:max-w-4xl">
      {/* ── Page header ── */}
      <div className="flex animate-fade-up items-center justify-between">
        <h1
          className="text-[26px] text-white"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Income
        </h1>
        {total > 0 && (
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-4 py-1.5 text-[13px] font-medium text-emerald-400">
            <span className="text-[11px] uppercase tracking-[.5px] text-emerald-500/60">
              This month
            </span>
            {formatINR(total)}
          </div>
        )}
      </div>

      {/* ── Add income form ── */}
      <div className="animate-fade-up-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,.6)]" />
          <p className="text-[13px] font-medium text-white/40">Add Income</p>
        </div>
        {/* IncomeForm renders here — pass your onAdded callback */}
        <IncomeForm onAdded={() => dispatch(fetchIncome(month))} />
      </div>

      {/* ── History card ── */}
      <div className="animate-fade-up overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
        {/* Header row */}
        <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-4">
          <div>
            <p className="text-[14px] font-medium text-white/60">
              Income History
            </p>
            {incomes.length > 0 && (
              <p className="mt-0.5 text-[12px] text-emerald-400">
                {incomes.length} {incomes.length === 1 ? "entry" : "entries"} ·{" "}
                {formatINR(total)} total
              </p>
            )}
          </div>
          <input
            type="month"
            value={month}
            onChange={(e) => dispatch(setIncomeMonth(e.target.value))}
            className="cursor-pointer rounded-[10px] border border-white/[0.08] bg-white/[0.05] px-3 py-1.5 text-[12px] text-white outline-none transition focus:border-emerald-500/30"
          />
        </div>

        {/* Summary strip */}
        {summaryEntries.length > 0 && (
          <div
            className="grid border-b border-white/[0.04] bg-white/[0.02]"
            style={{
              gridTemplateColumns: `repeat(${Math.min(summaryEntries.length, 4)}, 1fr)`,
            }}
          >
            {summaryEntries.slice(0, 4).map(([type, amt]) => {
              const s = getStyle(type);
              return (
                <div key={type} className="px-5 py-3 text-center">
                  <p
                    className={`text-[15px] font-medium ${s.badge.split(" ")[1]}`}
                  >
                    {formatINR(amt)}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[.7px] text-white/30">
                    {type}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* List */}
        {incomes.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-3 text-[32px] opacity-30">💸</p>
            <p className="text-[14px] text-white/20">
              No income logged for this month.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.04]">
            {incomes.map((inc, i) => {
              const s = getStyle(inc.type);
              return (
                <li
                  key={inc._id}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors duration-200 hover:bg-white/[0.025]"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Left */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] border text-[16px] ${s.iconBg}`}
                    >
                      {s.icon}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${s.badge}`}
                        >
                          {inc.type}
                        </span>
                        {inc.isRecurring && (
                          <span className="flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[11px] text-violet-400">
                            🔁 recurring
                          </span>
                        )}
                        {inc.note && (
                          <span className="text-[12px] text-white/40">
                            {inc.note}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-white/25">
                        {format(new Date(inc.date), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <span className="text-[16px] font-medium text-emerald-400">
                      {formatINR(inc.amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(inc._id)}
                      disabled={deleting === inc._id}
                      aria-label="Delete income"
                      className="flex h-7 w-7 items-center justify-center rounded-[8px] border-none bg-transparent text-[13px] text-red-400/50 transition-all hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                    >
                      {deleting === inc._id ? "…" : "✕"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
