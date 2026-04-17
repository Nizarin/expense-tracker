"use client";

import { useAppDispatch } from "@/store/hooks";
import { fetchExpenses } from "@/store/slices/expenseSlice";
import { useAppSelector } from "@/store/hooks";
import ExpenseForm from "@/app/components/ExpenseForm";
import ExpenseList from "@/app/components/ExpenseList";
import CategoryManager from "@/app/components/CategoryManager";
import { useState } from "react";

export default function ExpensesPage() {
  const dispatch = useAppDispatch();
  const month = useAppSelector((s) => s.expenses.selectedMonth);
  const [showCategories, setShowCategories] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6 lg:px-8 2xl:max-w-4xl">
      {/* ── Page header ── */}
      <div className="flex animate-fade-up items-center justify-between">
        <h1
          className="text-[26px] text-white"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Expenses
        </h1>
        <button
          onClick={() => setShowCategories((v) => !v)}
          className={`flex items-center gap-2 rounded-[12px] border px-4 py-2 text-[13px] font-medium transition-all duration-200
            ${
              showCategories
                ? "border-violet-500/35 bg-violet-500/15 text-violet-400"
                : "border-white/[0.08] bg-white/[0.04] text-white/50 hover:border-violet-500/30 hover:bg-violet-500/[0.12] hover:text-white"
            }`}
        >
          {showCategories ? "✕ Hide" : "⚙"} Categories
        </button>
      </div>

      {/* ── Category manager ── */}
      {showCategories && <CategoryManager />}

      {/* ── Expense form ── */}
      <ExpenseForm onAdded={() => dispatch(fetchExpenses({ month }))} />

      {/* ── Expense list ── */}
      <ExpenseList />
    </div>
  );
}
