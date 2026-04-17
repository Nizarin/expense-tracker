"use client";

import { useEffect } from "react";
import { formatINR } from "@/lib/format";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchExpenses,
  deleteExpense,
  setExpenseMonth,
} from "@/store/slices/expenseSlice";

export default function ExpenseList() {
  const dispatch = useAppDispatch();
  const {
    items: expenses,
    status,
    selectedMonth: month,
  } = useAppSelector((s) => s.expenses);

  useEffect(() => {
    dispatch(fetchExpenses({ month }));
  }, [dispatch, month]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
        <p className="font-medium text-zinc-700 dark:text-zinc-200">Expenses</p>
        <input
          type="month"
          value={month}
          onChange={(e) => dispatch(setExpenseMonth(e.target.value))}
          className="rounded-lg border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        />
      </div>

      {status === "loading" ? (
        <p className="p-5 text-sm text-zinc-400">Loading…</p>
      ) : expenses.length === 0 ? (
        <p className="p-5 text-sm text-zinc-400">No expenses for this month.</p>
      ) : (
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {expenses.map((e) => (
            <li
              key={e._id}
              className="flex items-center justify-between px-5 py-3"
            >
              <div>
                <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                  {e.category}
                </span>
                {e.note && (
                  <span className="ml-2 text-sm text-zinc-500">{e.note}</span>
                )}
                <p className="mt-0.5 text-xs text-zinc-400">
                  {format(new Date(e.date), "dd MMM yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                  {formatINR(e.amount)}
                </span>
                <button
                  onClick={() => dispatch(deleteExpense(e._id))}
                  className="text-xs text-red-400 hover:text-red-600"
                  aria-label="Delete expense"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
