import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUserId } from "@/lib/authUser";
import SavingsGoal from "@/models/SavingsGoal";

// PUT /api/savings/:id — full update
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    await connectDB();
    const { id } = await params;
    const { currentAmount, isCompleted } = await req.json();

    const update: Record<string, unknown> = {};
    if (currentAmount !== undefined) update.currentAmount = Math.round(currentAmount);
    if (isCompleted !== undefined) update.isCompleted = isCompleted;

    const goal = await SavingsGoal.findOneAndUpdate(
      { _id: id, userId },
      { $set: update },
      { returnDocument: "after" }
    );
    if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ goal });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

// DELETE /api/savings/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    await connectDB();
    const { id } = await params;
    const deleted = await SavingsGoal.findOneAndDelete({ _id: id, userId });
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
