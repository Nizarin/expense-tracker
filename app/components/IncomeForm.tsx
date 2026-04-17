"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { INCOME_TYPES } from "@/lib/income_types";
import { rupeesToPaise } from "@/lib/format";

const schema = z.object({
  amount: z.number().positive("Enter a valid amount"),
  type: z.enum(INCOME_TYPES),
  note: z.string().max(200).optional(),
  date: z.string().min(1, "Date required"),
  isRecurring: z.boolean().optional(),
  recurringDay: z.number().min(1).max(28).optional(),
});

type FormData = z.infer<typeof schema>;

export default function IncomeForm({ onAdded }: { onAdded: () => void }) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "Salary",
      date: new Date().toISOString().slice(0, 10),
      isRecurring: false,
    },
  });

  const isRecurring = watch("isRecurring");

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, amount: rupeesToPaise(data.amount) }),
    });
    if (res.ok) {
      reset();
      onAdded();
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 space-y-4"
    >
      <p className="font-medium text-zinc-700 dark:text-zinc-200">Add Income</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="text-xs text-zinc-500">Amount (₹)</label>
          <input
            type="number"
            step="0.01"
            placeholder="50000"
            {...register("amount", { valueAsNumber: true })}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
          {errors.amount && (
            <p className="text-xs text-red-500 mt-0.5">
              {errors.amount.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-xs text-zinc-500">Type</label>
          <select
            {...register("type")}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            {INCOME_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-zinc-500">Date</label>
          <input
            type="date"
            {...register("date")}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500">Note</label>
          <input
            type="text"
            placeholder="Optional"
            {...register("note")}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="recurring"
          {...register("isRecurring")}
          className="rounded"
        />
        <label
          htmlFor="recurring"
          className="text-sm text-zinc-600 dark:text-zinc-400"
        >
          Recurring monthly
        </label>
        {isRecurring && (
          <input
            type="number"
            min={1}
            max={28}
            placeholder="Day (1-28)"
            {...register("recurringDay", { valueAsNumber: true })}
            className="w-32 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {isSubmitting ? "Adding…" : "Add Income"}
      </button>
    </form>
  );
}
