"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { rupeesToPaise, paiseToRupees } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSettings, saveSettings } from "@/store/slices/settingsSlice";

const schema = z.object({
  monthlyIncome: z.number().min(0),
  savingsRatePercent: z.number().min(0).max(100),
  investmentRatePercent: z.number().min(0).max(100),
  monthlyBudgetLimit: z.number().min(0),
});
type FormData = z.infer<typeof schema>;

/* ── tiny helpers ── */
function fmt(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

/* ── reusable field wrapper ── */
function FieldRow({
  label,
  desc,
  children,
}: {
  label: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="flex-1">
        <p className="text-[14px] font-medium text-white/75">{label}</p>
        <p className="mt-1 text-[12px] leading-relaxed text-white/30">{desc}</p>
      </div>
      <div className="flex flex-shrink-0 flex-col items-start gap-1.5 sm:items-end">
        {children}
      </div>
    </div>
  );
}

/* ── range slider ── */
function RangeSlider({
  id,
  value,
  color = "violet",
  onChange,
}: {
  id: string;
  value: number;
  color?: "violet" | "emerald";
  onChange: (v: number) => void;
}) {
  const accent = color === "emerald" ? "#34d399" : "#a78bfa";
  const trackColor =
    color === "emerald"
      ? `linear-gradient(90deg, #34d399 ${value}%, rgba(255,255,255,0.08) ${value}%)`
      : `linear-gradient(90deg, #6b4fff ${value}%, rgba(255,255,255,0.08) ${value}%)`;

  return (
    <div className="flex w-full flex-col gap-2 sm:w-44">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-white/25">0%</span>
        <span className="text-[14px] font-medium" style={{ color: accent }}>
          {value}%
        </span>
        <span className="text-[11px] text-white/25">100%</span>
      </div>
      <input
        type="range"
        id={id}
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-[5px] w-full cursor-pointer appearance-none rounded-full outline-none"
        style={{
          background: trackColor,
          // thumb styles via globals.css — see below
        }}
      />
    </div>
  );
}

/* ── number stepper ── */
function NumberStepper({
  id,
  value,
  step = 1000,
  suffix = "₹",
  onChange,
}: {
  id: string;
  value: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-[12px] border border-white/[0.09] bg-white/[0.05]">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - step))}
        className="flex h-[38px] w-9 items-center justify-center text-[18px] text-white/40 transition hover:bg-white/[0.07] hover:text-white"
      >
        −
      </button>
      <input
        type="number"
        id={id}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        className="h-[38px] w-20 bg-transparent text-center text-[14px] font-medium text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="pr-2.5 text-[12px] font-medium text-white/35">
        {suffix}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + step)}
        className="flex h-[38px] w-9 items-center justify-center text-[18px] text-white/40 transition hover:bg-white/[0.07] hover:text-white"
      >
        +
      </button>
    </div>
  );
}

/* ══════════════════════════════
   PAGE
   ══════════════════════════════ */
export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { data: settingsData } = useAppSelector((s) => s.settings);
  const [saved, setSaved] = useState(false);
  const [savRate, setSavRate] = useState(20);
  const [invRate, setInvRate] = useState(50);
  const [income, setIncome] = useState(0);
  const [budget, setBudget] = useState(0);

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      monthlyIncome: 0,
      savingsRatePercent: 20,
      investmentRatePercent: 50,
      monthlyBudgetLimit: 0,
    },
  });

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (!settingsData) return;
    const inc = paiseToRupees(settingsData.monthlyIncome ?? 0);
    const bud = paiseToRupees(settingsData.monthlyBudgetLimit ?? 0);
    const sav = settingsData.savingsRatePercent;
    const inv = settingsData.investmentRatePercent;
    reset({
      monthlyIncome: inc,
      savingsRatePercent: sav,
      investmentRatePercent: inv,
      monthlyBudgetLimit: bud,
    });
    // batch all state updates together to avoid cascading renders
    Promise.resolve().then(() => {
      setIncome(inc);
      setBudget(bud);
      setSavRate(sav);
      setInvRate(inv);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsData]);

  /* keep RHF in sync when sliders/steppers change */
  function handleSavRate(v: number) {
    setSavRate(v);
    setValue("savingsRatePercent", v, { shouldDirty: true });
  }
  function handleInvRate(v: number) {
    setInvRate(v);
    setValue("investmentRatePercent", v, { shouldDirty: true });
  }
  function handleIncome(v: number) {
    setIncome(v);
    setValue("monthlyIncome", v, { shouldDirty: true });
  }
  function handleBudget(v: number) {
    setBudget(v);
    setValue("monthlyBudgetLimit", v, { shouldDirty: true });
  }

  async function onSubmit(data: FormData) {
    await dispatch(
      saveSettings({
        savingsRatePercent: data.savingsRatePercent,
        investmentRatePercent: data.investmentRatePercent,
        monthlyBudgetLimit: rupeesToPaise(data.monthlyBudgetLimit),
        monthlyIncome: rupeesToPaise(data.monthlyIncome),
      }),
    );
    reset(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  /* live preview numbers */
  const netBalance = Math.max(0, income - budget * 0.84); // approx
  const savingsAmount = Math.floor(netBalance * (savRate / 100));
  const investable = Math.floor(savingsAmount * (invRate / 100));

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      {/* ── Header ── */}
      <div className="flex animate-fade-up items-center justify-between">
        <h1
          className="text-[26px] text-white"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Settings
        </h1>
        {saved && (
          <span className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-[12px] font-medium text-emerald-400 animate-fade-up">
            ✓ Saved
          </span>
        )}
      </div>

      {/* ── Live preview card ── */}
      <div className="animate-fade-up rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="block h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,.5)]" />
          <p className="text-[13px] font-medium text-white/40">Live Preview</p>
        </div>

        {/* Stats */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          {[
            {
              val: fmt(income),
              label: "Monthly Income",
              color: "text-emerald-400",
            },
            {
              val: fmt(savingsAmount),
              label: "Saves / month",
              color: "text-violet-400",
            },
            {
              val: fmt(investable),
              label: "Investable",
              color: "text-amber-400",
            },
          ].map(({ val, label, color }) => (
            <div
              key={label}
              className="rounded-[14px] border border-white/[0.05] bg-white/[0.03] px-3 py-3 text-center"
            >
              <p className={`text-[15px] font-medium ${color}`}>{val}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[.6px] text-white/30">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Flow diagram */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-white/[0.05] pt-4">
          {[
            {
              label: "Income",
              val: fmt(income),
              cls: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
            },
            {
              label: "Expenses",
              val: `−${fmt(budget)}`,
              cls: "bg-red-500/10 border-red-500/20 text-red-400",
            },
            {
              label: "Net",
              val: fmt(netBalance),
              cls: "bg-blue-500/10 border-blue-500/20 text-blue-400",
            },
            {
              label: "Savings",
              val: fmt(savingsAmount),
              cls: "bg-violet-500/10 border-violet-500/20 text-violet-400",
            },
            {
              label: "Invest",
              val: fmt(investable),
              cls: "bg-amber-500/10 border-amber-500/20 text-amber-400",
            },
          ].map(({ label, val, cls }, i, arr) => (
            <div key={label} className="flex items-center gap-1.5">
              <div
                className={`flex-1 rounded-[10px] border px-3 py-2 text-center text-[12px] font-medium ${cls}`}
              >
                {val}
                <div className="mt-0.5 text-[10px] opacity-50">{label}</div>
              </div>
              {i < arr.length - 1 && (
                <span className="text-[13px] text-white/20">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Form card ── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="animate-fade-up-2 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]"
      >
        {/* Section — Income & Budget */}
        <div className="space-y-5 border-b border-white/[0.05] p-5">
          <p className="text-[10px] uppercase tracking-[1px] text-white/25">
            Income & Budget
          </p>

          <FieldRow
            label="Monthly Income"
            desc="Fallback when no income is logged this month"
          >
            <NumberStepper
              id="monthlyIncome"
              value={income}
              step={1000}
              onChange={handleIncome}
            />
          </FieldRow>

          <FieldRow
            label="Monthly Budget Limit"
            desc="Get alerted when spending exceeds this. Set 0 to disable."
          >
            <NumberStepper
              id="monthlyBudgetLimit"
              value={budget}
              step={1000}
              onChange={handleBudget}
            />
          </FieldRow>
        </div>

        {/* Section — Rates */}
        <div className="space-y-5 border-b border-white/[0.05] p-5">
          <p className="text-[10px] uppercase tracking-[1px] text-white/25">
            Savings & Investment Rates
          </p>

          <FieldRow
            label="Savings Rate"
            desc="% of net balance (income − expenses) to set aside each month"
          >
            <RangeSlider
              id="savingsRate"
              value={savRate}
              color="violet"
              onChange={handleSavRate}
            />
          </FieldRow>

          <FieldRow
            label="Investment Rate"
            desc="% of your savings amount to put into investments"
          >
            <RangeSlider
              id="investmentRate"
              value={invRate}
              color="emerald"
              onChange={handleInvRate}
            />
          </FieldRow>
        </div>

        {/* Section — Preferences */}
        <div className="space-y-5 border-b border-white/[0.05] p-5">
          <p className="text-[10px] uppercase tracking-[1px] text-white/25">
            Preferences
          </p>

          <FieldRow
            label="Currency"
            desc="Used across the app for all amount displays"
          >
            <div className="flex items-center overflow-hidden rounded-[12px] border border-white/[0.09] bg-white/[0.05]">
              <select className="h-[38px] min-w-[110px] bg-transparent px-3 text-[13px] text-white outline-none [&>option]:bg-[#1a1a2e] cursor-pointer">
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
              </select>
            </div>
          </FieldRow>
        </div>

        {/* Save button */}
        <div className="bg-white/[0.02] p-4">
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="w-full rounded-[14px] border border-violet-500/30 bg-gradient-to-br from-violet-500/25 to-violet-500/10 py-3 text-[14px] font-medium text-violet-400 transition-all hover:-translate-y-px hover:from-violet-500/35 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </form>

      {/* ── Danger zone ── */}
      <div className="animate-fade-up rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-5">
        <div className="mb-1 flex items-center gap-2">
          <span className="block h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_6px_rgba(248,113,113,.5)]" />
          <p className="text-[13px] font-medium text-red-400/70">Danger Zone</p>
        </div>
        <p className="mb-4 text-[12px] leading-relaxed text-white/25">
          Permanently delete all your expenses, income, savings goals, and
          settings. This action{" "}
          <strong className="text-white/40">cannot be undone</strong>.
        </p>
        <button
          type="button"
          className="rounded-[11px] border border-red-500/20 bg-red-500/10 px-5 py-2 text-[13px] font-medium text-red-400 transition-all hover:bg-red-500/18"
        >
          Delete all my data
        </button>
      </div>
    </div>
  );
}
