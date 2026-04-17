import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUserId } from "@/lib/authUser";
import Income from "@/models/Income";
import Expense from "@/models/Expense";
import SavingsGoal from "@/models/SavingsGoal";
import { getOrCreateSettings } from "@/lib/getSettings";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
    const [y, m] = month.split("-").map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);

    const settings = await getOrCreateSettings(userId);

    const [incomeAgg, expenseAgg, expByCategory, goals, incomeTrend, expenseTrend] =
      await Promise.all([
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
        // 6-month income trend
        Income.aggregate([
          { $match: { userId, date: { $gte: new Date(y, m - 7, 1), $lt: end } } },
          { $group: { _id: { year: { $year: "$date" }, month: { $month: "$date" } }, total: { $sum: "$amount" } } },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),
        // 6-month expense trend
        Expense.aggregate([
          { $match: { userId, date: { $gte: new Date(y, m - 7, 1), $lt: end } } },
          { $group: { _id: { year: { $year: "$date" }, month: { $month: "$date" } }, total: { $sum: "$amount" } } },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),
      ]);

    const totalIncome = incomeAgg[0]?.total ?? 0;
    const totalExpense = expenseAgg[0]?.total ?? 0;
    const netBalance = totalIncome - totalExpense;
    const savingsAmount = Math.max(0, Math.floor(netBalance * (settings.savingsRatePercent / 100)));
    const investable = Math.floor(savingsAmount * (settings.investmentRatePercent / 100));
    const overspend = totalIncome > 0 && totalExpense >= totalIncome * 0.8;
    const budgetUsedPct = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;

    return NextResponse.json({
      totalIncome,
      totalExpense,
      netBalance,
      savingsAmount,
      investable,
      overspend,
      budgetUsedPct,
      expByCategory,
      goals,
      incomeTrend,
      expenseTrend,
      settings: {
        savingsRatePercent: settings.savingsRatePercent,
        investmentRatePercent: settings.investmentRatePercent,
        monthlyBudgetLimit: settings.monthlyBudgetLimit,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
