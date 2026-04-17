import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUserId } from "@/lib/authUser";
import CustomCategory from "@/models/CustomCategory";
import { CATEGORIES } from "@/lib/categories";

// GET /api/categories — defaults + user custom merged
export async function GET() {
  try {
    const userId = await getAuthUserId();
    await connectDB();
    const custom = await CustomCategory.find({ userId }).lean();
    return NextResponse.json({
      defaults: CATEGORIES,
      custom,
      all: [...CATEGORIES, ...custom.map((c) => c.name)],
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

// POST /api/categories — create custom category
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    await connectDB();
    const { name, colorHex } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const cat = await CustomCategory.create({ userId, name: name.trim(), colorHex });
    return NextResponse.json({ category: cat }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "Unauthorized" ? 401 : msg.includes("duplicate") ? 409 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
