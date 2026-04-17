import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Income from "@/models/Income";
import Expense from "@/models/Expense";
import SavingsGoal from "@/models/SavingsGoal";
import { getOrCreateSettings } from "@/lib/getSettings";
import { formatINR } from "@/lib/format";
import Image from "next/image";
import Link from "next/link";
import mongoose from "mongoose";

/* ── tiny server component helpers ── */
function StatCard({
  icon,
  label,
  value,
  sub,
  valueClass,
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
  valueClass: string;
}) {
  return (
    <div className="group flex flex-col gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.055]">
      <span className="text-[22px] opacity-70">{icon}</span>
      <p className="text-[11px] uppercase tracking-[.8px] text-white/30">
        {label}
      </p>
      <p className={`text-[22px] font-medium leading-none ${valueClass}`}>
        {value}
      </p>
      <p className="text-[11px] text-white/25">{sub}</p>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="block h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_6px_rgba(107,79,255,.6)]" />
        <p className="text-[13px] font-medium text-white/45">{title}</p>
      </div>
      {children}
    </div>
  );
}

const CAT_COLORS: Record<string, string> = {
  Food: "bg-red-400/80",
  Transport: "bg-emerald-400/80",
  Shopping: "bg-blue-400/80",
  Bills: "bg-amber-400/80",
  Health: "bg-pink-400/80",
  Entertainment: "bg-violet-400/80",
  Investment: "bg-teal-400/80",
  Other: "bg-zinc-400/80",
};

const BAR_COLORS: Record<string, string> = {
  Food: "from-red-400 to-red-600",
  Transport: "from-emerald-400 to-emerald-600",
  Shopping: "from-blue-400 to-blue-600",
  Bills: "from-amber-400 to-amber-600",
  Health: "from-pink-400 to-pink-600",
  Entertainment: "from-violet-400 to-violet-600",
  Investment: "from-teal-400 to-teal-600",
  Other: "from-zinc-400 to-zinc-600",
};

/* ══════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════ */
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await connectDB();

  const dbUser = (await User.findOne({ email: session.user.email }).lean()) as {
    _id: mongoose.Types.ObjectId;
    name: string;
    image?: string;
  } | null;
  if (!dbUser) redirect("/login");

  const userId = dbUser._id;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const settings = await getOrCreateSettings(userId);

  const [incomeAgg, expenseAgg, expByCategory, goals] = await Promise.all([
    Income.aggregate([
      { $match: { userId, date: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: { userId, date: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: { userId, date: { $gte: start, $lt: end } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]),
    SavingsGoal.find({ userId, isCompleted: false }).lean(),
  ]);

  const totalIncome = incomeAgg[0]?.total ?? 0;
  const totalExpense = expenseAgg[0]?.total ?? 0;
  const netBalance = totalIncome - totalExpense;
  const savingsAmount = Math.max(
    0,
    Math.floor(netBalance * (settings.savingsRatePercent / 100)),
  );
  const investable = Math.floor(
    savingsAmount * (settings.investmentRatePercent / 100),
  );
  const overspend = totalIncome > 0 && totalExpense >= totalIncome * 0.8;
  const budgetPct =
    totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;

  const cards = [
    {
      icon: "💵",
      label: "Total Income",
      value: formatINR(totalIncome),
      sub: "This month",
      valueClass: "text-emerald-400",
    },
    {
      icon: "💸",
      label: "Total Expenses",
      value: formatINR(totalExpense),
      sub: `${budgetPct}% of income`,
      valueClass: "text-red-400",
    },
    {
      icon: "⚖️",
      label: "Net Balance",
      value: formatINR(netBalance),
      sub: "After expenses",
      valueClass: netBalance >= 0 ? "text-blue-400" : "text-red-400",
    },
    {
      icon: "🏦",
      label: `Savings (${settings.savingsRatePercent}%)`,
      value: formatINR(savingsAmount),
      sub: "From net balance",
      valueClass: "text-violet-400",
    },
    {
      icon: "📈",
      label: `Investable (${settings.investmentRatePercent}%)`,
      value: formatINR(investable),
      sub: "Surplus after savings",
      valueClass: "text-purple-400",
    },
    {
      icon: "🎯",
      label: "Budget Used",
      value: `${budgetPct}%`,
      sub: budgetPct >= 80 ? "⚠ Near limit" : "On track",
      valueClass: budgetPct >= 80 ? "text-amber-400" : "text-emerald-400",
    },
  ];

  const monthLabel = now.toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const firstName = dbUser.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6 lg:px-8 2xl:max-w-5xl">
      {/* ── Header ── */}
      <div className="flex animate-fade-up items-center justify-between">
        <div className="flex items-center gap-3.5">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={dbUser.name}
              width={48}
              height={48}
              className="rounded-full ring-2 ring-violet-500/30"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-emerald-400 text-[15px] font-semibold text-white">
              {firstName[0]}
            </div>
          )}
          <div>
            <p className="text-[18px] font-medium text-white">
              Hey, {firstName} 👋
            </p>
            <p className="text-[13px] text-white/35">{monthLabel}</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-[12px] text-white/40 sm:flex">
          <span className="block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,.6)]" />
          Live · This month
        </div>
      </div>

      {/* ── Overspend alert ── */}
      {overspend && (
        <div className="animate-fade-up flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3.5 text-[13px] text-red-300">
          🚨
          <span>
            You&apos;ve spent{" "}
            <strong className="text-red-300">{budgetPct}%</strong> of your
            income this month. Consider reducing discretionary spending.
          </span>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="animate-fade-up-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      {/* ── Budget progress bar ── */}
      {totalIncome > 0 && (
        <SectionCard title="Budget Overview">
          <div className="mb-2 flex items-center justify-between text-[12px] text-white/35">
            <span>Spent so far</span>
            <span>
              {formatINR(totalExpense)} / {formatINR(totalIncome)}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className={`h-full rounded-full bg-gradient-to-r transition-all duration-700
                ${
                  budgetPct >= 100
                    ? "from-red-400 to-red-600"
                    : budgetPct >= 80
                      ? "from-amber-400 to-amber-600"
                      : "from-emerald-400 to-emerald-600"
                }`}
              style={{ width: `${Math.min(100, budgetPct)}%` }}
            />
          </div>
        </SectionCard>
      )}

      {/* ── Category breakdown ── */}
      {expByCategory.length > 0 && (
        <SectionCard title="Spending by Category">
          <div className="space-y-4">
            {(expByCategory as { _id: string; total: number }[]).map(
              ({ _id, total }) => {
                const pct =
                  totalExpense > 0
                    ? Math.round((total / totalExpense) * 100)
                    : 0;
                const incPct =
                  totalIncome > 0 ? Math.round((total / totalIncome) * 100) : 0;
                const dot = CAT_COLORS[_id] ?? "bg-zinc-400/80";
                const bar = BAR_COLORS[_id] ?? "from-zinc-400 to-zinc-600";
                return (
                  <div key={_id}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[13px] text-white/65">
                        <span className={`block h-2 w-2 rounded-full ${dot}`} />
                        {_id}
                      </div>
                      <span className="text-[11px] text-white/30">
                        {formatINR(total)} · {pct}% of spend · {incPct}% of
                        income
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${bar}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </SectionCard>
      )}

      {/* ── Savings goals ── */}
      {goals.length > 0 && (
        <SectionCard title="Active Savings Goals">
          <div className="space-y-4">
            {(
              goals as {
                _id: unknown;
                title: string;
                currentAmount: number;
                targetAmount: number;
              }[]
            ).map((g) => {
              const pct = Math.min(
                100,
                Math.round((g.currentAmount / g.targetAmount) * 100),
              );
              return (
                <div key={String(g._id)}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[13px] text-white/65">{g.title}</span>
                    <span className="text-[12px] font-medium text-violet-400">
                      {formatINR(g.currentAmount)} / {formatINR(g.targetAmount)}{" "}
                      ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r transition-all duration-700
                        ${pct >= 100 ? "from-emerald-400 to-emerald-600" : "from-violet-400 to-violet-600"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* ── Investment suggestion ── */}
      {investable > 0 && (
        <div className="animate-fade-up flex items-start gap-3.5 rounded-2xl border border-violet-500/20 bg-violet-500/[0.08] p-4">
          <span className="mt-0.5 text-[22px]">💡</span>
          <div>
            <p className="mb-1 text-[13px] font-medium text-violet-300">
              Investment Suggestion
            </p>
            <p className="text-[12px] leading-relaxed text-white/35">
              You have{" "}
              <strong className="text-violet-300">
                {formatINR(investable)}
              </strong>{" "}
              investable this month. Consider SIP in index funds or liquid
              mutual funds for steady long-term returns.
            </p>
          </div>
        </div>
      )}

      {/* ── Quick actions ── */}
      <div className="animate-fade-up grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: "/income", icon: "➕", label: "Add Income" },
          { href: "/expenses", icon: "💸", label: "Log Expense" },
          { href: "/savings", icon: "🎯", label: "New Goal" },
          { href: "/insights", icon: "📊", label: "View Insights" },
        ].map(({ href, icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-[13px] font-medium text-white/55 transition-all duration-200 hover:border-violet-500/30 hover:bg-violet-500/[0.12] hover:text-white"
          >
            {icon} {label}
          </Link>
        ))}
      </div>

      {/* ── Empty state ── */}
      {totalIncome === 0 && totalExpense === 0 && (
        <div className="animate-fade-up rounded-2xl border border-dashed border-white/[0.1] p-12 text-center text-[14px] leading-loose text-white/25">
          Nothing logged yet.{" "}
          <Link href="/income" className="text-violet-400 hover:underline">
            Add income
          </Link>{" "}
          or{" "}
          <Link href="/expenses" className="text-violet-400 hover:underline">
            log an expense
          </Link>
          .
        </div>
      )}
    </div>
  );
}
