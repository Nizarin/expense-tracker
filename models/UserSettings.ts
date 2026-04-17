import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserSettings extends Document {
  userId: mongoose.Types.ObjectId;
  currency: string;
  savingsRatePercent: number;   // 0–100
  investmentRatePercent: number; // 0–100
  monthlyBudgetLimit: number;   // paise, 0 = no limit
  monthlyIncome: number;        // paise, used as fallback for suggestions
}

const UserSettingsSchema = new Schema<IUserSettings>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  currency: { type: String, default: "INR" },
  savingsRatePercent: { type: Number, default: 20, min: 0, max: 100 },
  investmentRatePercent: { type: Number, default: 50, min: 0, max: 100 },
  monthlyBudgetLimit: { type: Number, default: 0 },
  monthlyIncome: { type: Number, default: 0 },
});

const UserSettings: Model<IUserSettings> =
  mongoose.models.UserSettings ??
  mongoose.model<IUserSettings>("UserSettings", UserSettingsSchema);

export default UserSettings;
