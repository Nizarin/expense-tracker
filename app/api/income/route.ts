import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUserId } from "@/lib/authUser";
import Income from "@/models/Income";
import { INCOME_TYPES, IncomeType } from "@/lib/income_types";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // YYYY-MM

    const filter: Record<string, unknown> = { userId };
    if (month) {
      const [y, m] = month.split("-").map(Number);
      filter.date = { $gte: new Date(y, m - 1, 1), $lt: new Date(y, m, 1) };
    }

    const incomes = await Income.find(filter).sort({ date: -1 }).lean();
    return NextResponse.json({ incomes });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    await connectDB();

    const { amount, type, note, date, isRecurring, recurringDay } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (!INCOME_TYPES.includes(type as IncomeType)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const income = await Income.create({
      userId,
      amount: Math.round(amount),
      type,
      note: note ?? "",
      date: date ? new Date(date) : new Date(),
      isRecurring: !!isRecurring,
      recurringDay: isRecurring ? recurringDay : undefined,
    });

    return NextResponse.json({ income }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
