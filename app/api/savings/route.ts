import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUserId } from "@/lib/authUser";
import SavingsGoal from "@/models/SavingsGoal";

export async function GET() {
  try {
    const userId = await getAuthUserId();
    await connectDB();
    const goals = await SavingsGoal.find({ userId }).sort({ deadline: 1 }).lean();
    return NextResponse.json({ goals });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    await connectDB();

    const { title, targetAmount, currentAmount, deadline } = await req.json();

    if (!title || !targetAmount || !deadline) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const goal = await SavingsGoal.create({
      userId,
      title,
      targetAmount: Math.round(targetAmount),
      currentAmount: Math.round(currentAmount ?? 0),
      deadline: new Date(deadline),
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
