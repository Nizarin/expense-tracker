"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { rupeesToPaise } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCategories } from "@/store/slices/categoriesSlice";
import { addExpense } from "@/store/slices/expenseSlice";

const schema = z.object({
  amount: z.number().positive("Enter a valid amount"),
  category: z.string().min(1, "Select a category"),
  note: z.string().max(200).optional(),
  date: z.string().min(1, "Date required"),
});
type FormData = z.infer<typeof schema>;

const CAT_ICONS: Record<string, string> = {
  Food: "🍔",
  Transport: "🚗",
  Shopping: "🛍️",
  Bills: "💡",
  Health: "💊",
  Entertainment: "🎬",
  Investment: "📈",
  Other: "💸",
};

export default function ExpenseForm({ onAdded }: { onAdded: () => void }) {
  const dispatch = useAppDispatch();
  const allCategories = useAppSelector((s) => s.categories.all);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "Food",
      date: new Date().toISOString().slice(0, 10),
    },
  });

  async function onSubmit(data: FormData) {
    const result = await dispatch(
      addExpense({ ...data, amount: rupeesToPaise(data.amount) }),
    );
    if (addExpense.fulfilled.match(result)) {
      reset({ category: data.category, date: data.date });
      onAdded();
    }
  }

  return (
    <div className="animate-fade-up-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <span className="block h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_6px_rgba(248,113,113,.6)]" />
        <p className="text-[13px] font-medium text-white/40">Log Expense</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[.7px] text-white/30">
              Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="500"
              {...register("amount", { valueAsNumber: true })}
              className="rounded-[12px] border border-white/[0.08] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white outline-none transition focus:border-red-400/40 focus:bg-red-500/[0.04] placeholder:text-white/20"
            />
            {errors.amount && (
              <p className="text-[11px] text-red-400">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[.7px] text-white/30">
              Category
            </label>
            <select
              {...register("category")}
              className="rounded-[12px] border border-white/[0.08] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white outline-none transition focus:border-red-400/40 [&>option]:bg-[#1a1a2e]"
            >
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {CAT_ICONS[c] ?? "•"} {c}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[.7px] text-white/30">
              Date
            </label>
            <input
              type="date"
              {...register("date")}
              className="rounded-[12px] border border-white/[0.08] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white outline-none transition focus:border-red-400/40 focus:bg-red-500/[0.04]"
            />
            {errors.date && (
              <p className="text-[11px] text-red-400">{errors.date.message}</p>
            )}
          </div>

          {/* Note */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[.7px] text-white/30">
              Note
            </label>
            <input
              type="text"
              placeholder="Optional"
              {...register("note")}
              className="rounded-[12px] border border-white/[0.08] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white outline-none transition focus:border-red-400/40 focus:bg-red-500/[0.04] placeholder:text-white/20"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-[14px] border border-red-400/25 bg-gradient-to-br from-red-400/20 to-red-400/[0.08] px-6 py-2.5 text-[14px] font-medium text-red-400 transition-all hover:-translate-y-px hover:from-red-400/30 hover:to-red-400/14 disabled:opacity-40"
        >
          {isSubmitting ? "Adding…" : "+ Add Expense"}
        </button>
      </form>
    </div>
  );
}
