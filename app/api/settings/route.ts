import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUserId } from "@/lib/authUser";
import { getOrCreateSettings } from "@/lib/getSettings";
import UserSettings from "@/models/UserSettings";

export async function GET() {
  try {
    const userId = await getAuthUserId();
    await connectDB();
    const settings = await getOrCreateSettings(userId);
    return NextResponse.json({ settings });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    await connectDB();
    const body = await req.json();

    const allowed = ["savingsRatePercent", "investmentRatePercent", "monthlyBudgetLimit", "monthlyIncome", "currency"];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: update },
      { upsert: true, returnDocument: "after" }
    );
    return NextResponse.json({ settings });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
