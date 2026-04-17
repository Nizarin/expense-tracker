import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUserId } from "@/lib/authUser";
import Expense from "@/models/Expense";
import CustomCategory from "@/models/CustomCategory";
import { CATEGORIES } from "@/lib/categories";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const category = searchParams.get("category");

    const filter: Record<string, unknown> = { userId };
    if (month) {
      const [year, mon] = month.split("-").map(Number);
      filter.date = { $gte: new Date(year, mon - 1, 1), $lt: new Date(year, mon, 1) };
    }
    if (category) filter.category = category;

    const expenses = await Expense.find(filter).sort({ date: -1 }).lean();
    return NextResponse.json({ expenses });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    await connectDB();

    const { amount, category, note, date } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Accept default categories OR user's custom categories
    const isDefault = (CATEGORIES as readonly string[]).includes(category);
    if (!isDefault) {
      const custom = await CustomCategory.findOne({ userId, name: category });
      if (!custom) return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const expense = await Expense.create({
      userId,
      amount: Math.round(amount),
      category,
      note: note ?? "",
      date: date ? new Date(date) : new Date(),
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
