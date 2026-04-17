import { Category } from "@/models/Expense";
import { formatINR } from "@/lib/format";

// Monthly thresholds in paise per category
const THRESHOLDS: Partial<Record<Category, number>> = {
  Food: 1500000,          // ₹15,000
  Shopping: 1000000,      // ₹10,000
  Entertainment: 500000,  // ₹5,000
  Transport: 600000,      // ₹6,000
};

export interface SavingsTip {
  category: Category;
  message: string;
  severity: "warning" | "danger";
}

export function getSavingsTips(
  byCategory: { _id: string; total: number }[]
): SavingsTip[] {
  const tips: SavingsTip[] = [];

  for (const { _id, total } of byCategory) {
    const threshold = THRESHOLDS[_id as Category];
    if (!threshold) continue;

    if (total >= threshold * 1.5) {
      tips.push({
        category: _id as Category,
        message: `${_id} spending (${formatINR(total)}) is 50%+ over your monthly limit. Consider cutting back.`,
        severity: "danger",
      });
    } else if (total >= threshold) {
      tips.push({
        category: _id as Category,
        message: `${_id} spending (${formatINR(total)}) has hit your monthly limit of ${formatINR(threshold)}.`,
        severity: "warning",
      });
    }
  }

  return tips;
}

/** Suggest 20% of remaining income as investment amount */
export function getInvestmentSuggestion(
  totalSpentPaise: number,
  monthlyIncomePaise = 10000000 // default ₹1,00,000
): number {
  const remaining = Math.max(0, monthlyIncomePaise - totalSpentPaise);
  return Math.round(remaining * 0.2);
}
