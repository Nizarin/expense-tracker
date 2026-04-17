import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";

/**
 * Returns the authenticated user's MongoDB _id.
 * Throws if unauthenticated or user not found.
 */
export async function getAuthUserId(): Promise<mongoose.Types.ObjectId> {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).select("_id").lean();
  if (!user) throw new Error("User not found");

  return (user as { _id: mongoose.Types.ObjectId })._id;
}
