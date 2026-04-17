import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUserId } from "@/lib/authUser";
import Income from "@/models/Income";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
    const [y, m] = month.split("-").map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);

    const byType = await Income.aggregate([
      { $match: { userId, date: { $gte: start, $lt: end } } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    const total = byType.reduce((s, t) => s + t.total, 0);
    return NextResponse.json({ byType, total });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
