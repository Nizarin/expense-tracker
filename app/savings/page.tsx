"use client";

import { useEffect, useState } from "react";
import { formatINR, rupeesToPaise } from "@/lib/format";
import { format, differenceInDays } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchGoals,
  addGoal,
  updateGoal,
  deleteGoal,
} from "@/store/slices/savingsSlice";

/* ── helpers ── */
const GOAL_EMOJIS: Record<string, string> = {
  emergency: "🛡️",
  vacation: "🏖️",
  laptop: "💻",
  car: "🚗",
  house: "🏠",
  phone: "📱",
  education: "🎓",
  wedding: "💍",
};

function getEmoji(title: string): string {
  const lower = title.toLowerCase();
  for (const [key, emoji] of Object.entries(GOAL_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return "🎯";
}

function getDaysLeft(deadline: string) {
  return differenceInDays(new Date(deadline), new Date());
}

function DaysChip({ deadline }: { deadline: string }) {
  const days = getDaysLeft(deadline);
  if (days < 0)
    return (
      <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[11px] text-red-400">
        ⚠ Deadline passed
      </span>
    );
  if (days === 0)
    return (
      <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[11px] text-red-400">
        🔴 Due today!
      </span>
    );
  if (days <= 14)
    return (
      <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[11px] text-red-400">
        🔴 {days} days left!
      </span>
    );
  if (days <= 60)
    return (
      <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-400">
        ⏳ {days} days left
      </span>
    );
  return (
    <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] text-blue-400">
      📅 {days} days left
    </span>
  );
}

export default function SavingsPage() {
  const dispatch = useAppDispatch();
  const { goals } = useAppSelector((s) => s.savings);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [updateVals, setUpdateVals] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await dispatch(
      addGoal({
        title,
        targetAmount: rupeesToPaise(parseFloat(target)),
        currentAmount: rupeesToPaise(parseFloat(current || "0")),
        deadline,
      }),
    );
    setTitle("");
    setTarget("");
    setCurrent("");
    setDeadline("");
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await dispatch(deleteGoal(id));
    setDeleting(null);
  }

  async function handleUpdate(id: string) {
    const val = parseFloat(updateVals[id] ?? "");
    if (isNaN(val) || val < 0) return;
    setUpdating(id);
    await dispatch(updateGoal({ id, currentAmount: rupeesToPaise(val) }));
    setUpdateVals((prev) => ({ ...prev, [id]: "" }));
    setUpdating(null);
  }

  /* summary stats */
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const overallPct =
    totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const activeCount = goals.filter(
    (g) => g.currentAmount < g.targetAmount,
  ).length;

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6 lg:px-8 2xl:max-w-4xl">
      {/* ── Page header ── */}
      <div className="flex animate-fade-up items-center justify-between">
        <h1
          className="text-[26px] text-white"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Savings Goals
        </h1>
        {totalSaved > 0 && (
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-4 py-1.5 text-[13px] font-medium text-emerald-400">
            <span className="text-[11px] uppercase tracking-[.5px] text-emerald-500/60">
              Total saved
            </span>
            {formatINR(totalSaved)}
          </div>
        )}
      </div>

      {/* ── Summary strip ── */}
      {goals.length > 0 && (
        <div className="animate-fade-up grid grid-cols-3 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          {[
            {
              val: String(activeCount),
              label: "Active Goals",
              color: "text-emerald-400",
            },
            {
              val: formatINR(totalTarget),
              label: "Total Target",
              color: "text-violet-400",
            },
            {
              val: `${overallPct}%`,
              label: "Overall Progress",
              color: "text-blue-400",
            },
          ].map(({ val, label, color }, i) => (
            <div
              key={label}
              className={`px-5 py-4 text-center ${i < 2 ? "border-r border-white/[0.05]" : ""}`}
            >
              <p className={`text-[18px] font-medium ${color}`}>{val}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[.7px] text-white/30">
                {label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Add goal form ── */}
      <form
        onSubmit={handleAdd}
        className="animate-fade-up-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5"
      >
        <div className="mb-4 flex items-center gap-2">
          <span className="block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,.6)]" />
          <p className="text-[13px] font-medium text-white/40">New Goal</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Goal Title",
              value: title,
              setter: setTitle,
              type: "text",
              placeholder: "Emergency Fund",
            },
            {
              label: "Target (₹)",
              value: target,
              setter: setTarget,
              type: "number",
              placeholder: "50000",
            },
            {
              label: "Saved so far (₹)",
              value: current,
              setter: setCurrent,
              type: "number",
              placeholder: "0",
            },
            {
              label: "Deadline",
              value: deadline,
              setter: setDeadline,
              type: "date",
              placeholder: "",
            },
          ].map(({ label, value, setter, type, placeholder }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[.7px] text-white/30">
                {label}
              </label>
              <input
                type={type}
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                required
                className="rounded-[12px] border border-white/[0.08] bg-white/[0.05] px-3 py-2.5 text-[13px] text-white outline-none transition focus:border-emerald-400/40 focus:bg-emerald-500/[0.04] placeholder:text-white/20"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 rounded-[14px] border border-emerald-400/25 bg-gradient-to-br from-emerald-400/20 to-emerald-400/[0.08] px-6 py-2.5 text-[14px] font-medium text-emerald-400 transition-all hover:-translate-y-px hover:from-emerald-400/30 disabled:opacity-40"
        >
          {loading ? "Saving…" : "+ Add Goal"}
        </button>
      </form>

      {/* ── Goals grid ── */}
      {goals.length === 0 ? (
        <div className="animate-fade-up rounded-2xl border border-dashed border-white/[0.08] py-12 text-center">
          <p className="mb-3 text-[32px] opacity-30">🎯</p>
          <p className="text-[14px] text-white/20">
            No savings goals yet. Add one above.
          </p>
        </div>
      ) : (
        <div className="grid animate-fade-up grid-cols-1 gap-4 sm:grid-cols-2">
          {goals.map((g) => {
            const pct = Math.min(
              100,
              Math.round((g.currentAmount / g.targetAmount) * 100),
            );
            const done = pct >= 100;
            const barColor = done
              ? "from-emerald-400 to-emerald-600"
              : pct < 30
                ? "from-blue-400 to-violet-500"
                : getDaysLeft(g.deadline) <= 14
                  ? "from-amber-400 to-amber-600"
                  : "from-violet-400 to-violet-600";

            return (
              <div
                key={g._id}
                className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5
                  ${
                    done
                      ? "border-emerald-500/25 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.07]"
                      : "border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.055]"
                  }`}
              >
                {done && (
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/[0.06] to-transparent" />
                )}

                {/* Top row */}
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] border border-white/[0.08] bg-white/[0.06] text-[18px]">
                    {getEmoji(g.title)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[15px] font-medium text-white">
                      {g.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/30">
                      📅 {format(new Date(g.deadline), "dd MMM yyyy")}
                    </p>
                  </div>
                  {done ? (
                    <span className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
                      ✓ Complete
                    </span>
                  ) : (
                    <button
                      onClick={() => handleDelete(g._id)}
                      disabled={deleting === g._id}
                      aria-label={`Delete ${g.title}`}
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[8px] bg-transparent text-[13px] text-red-400/40 transition-all hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30"
                    >
                      {deleting === g._id ? "…" : "✕"}
                    </button>
                  )}
                </div>

                {/* Days left chip */}
                {!done && <DaysChip deadline={g.deadline} />}

                {/* Progress */}
                <div className="mb-4">
                  <div className="mb-2 flex items-end justify-between">
                    <div>
                      <p
                        className={`text-[17px] font-medium ${done ? "text-emerald-400" : "text-white"}`}
                      >
                        {formatINR(g.currentAmount)}
                      </p>
                      <p className="text-[11px] text-white/25">saved</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] text-white/30">
                        of {formatINR(g.targetAmount)}
                      </p>
                      <p
                        className={`text-[13px] font-medium ${done ? "text-emerald-400" : "text-violet-400"}`}
                      >
                        {pct}%
                      </p>
                    </div>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Update row */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Update saved amount (₹)"
                    value={updateVals[g._id] ?? ""}
                    onChange={(e) =>
                      setUpdateVals((prev) => ({
                        ...prev,
                        [g._id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdate(g._id);
                    }}
                    className="min-w-0 flex-1 rounded-[10px] border border-white/[0.07] bg-white/[0.05] px-3 py-2 text-[12px] text-white outline-none transition focus:border-emerald-400/35 placeholder:text-white/20"
                  />
                  <button
                    onClick={() => handleUpdate(g._id)}
                    disabled={updating === g._id}
                    className="flex-shrink-0 rounded-[10px] border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[12px] font-medium text-emerald-400 transition-all hover:bg-emerald-500/20 disabled:opacity-40"
                  >
                    {updating === g._id ? "…" : "Update"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
