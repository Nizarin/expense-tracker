import mongoose from "mongoose";
import UserSettings, { IUserSettings } from "@/models/UserSettings";

/** Fetch or create default settings for a user */
export async function getOrCreateSettings(
  userId: mongoose.Types.ObjectId
): Promise<IUserSettings> {
  const existing = await UserSettings.findOne({ userId });
  if (existing) return existing;
  return UserSettings.create({ userId });
}
