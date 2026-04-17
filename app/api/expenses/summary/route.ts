import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUserId } from "@/lib/authUser";
import Expense from "@/models/Expense";

// GET /api/expenses/summary?month=YYYY-MM
// Returns: totals by category + monthly trend (last 6 months)
export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
    const [year, mon] = month.split("-").map(Number);

    const monthStart = new Date(year, mon - 1, 1);
    const monthEnd = new Date(year, mon, 1);

    // Category breakdown for selected month
    const byCategory = await Expense.aggregate([
      { $match: { userId, date: { $gte: monthStart, $lt: monthEnd } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    // Monthly totals for last 6 months
    const sixMonthsAgo = new Date(year, mon - 7, 1);
    const monthlyTrend = await Expense.aggregate([
      { $match: { userId, date: { $gte: sixMonthsAgo, $lt: monthEnd } } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const totalThisMonth = byCategory.reduce((s, c) => s + c.total, 0);

    return NextResponse.json({ byCategory, monthlyTrend, totalThisMonth });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
