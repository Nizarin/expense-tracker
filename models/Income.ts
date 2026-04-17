import mongoose, { Schema, Document, Model } from "mongoose";

export const INCOME_TYPES = ["Salary", "Freelance", "Bonus", "Profit", "Other"] as const;
export type IncomeType = (typeof INCOME_TYPES)[number];

export interface IIncome extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number; // paise
  type: IncomeType;
  note?: string;
  date: Date;
  isRecurring: boolean;
  recurringDay?: number; // 1–28, day of month
}

const IncomeSchema = new Schema<IIncome>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    type: { type: String, enum: INCOME_TYPES, required: true },
    note: { type: String, trim: true, maxlength: 200 },
    date: { type: Date, default: Date.now },
    isRecurring: { type: Boolean, default: false },
    recurringDay: { type: Number, min: 1, max: 28 },
  },
  { timestamps: false }
);

const Income: Model<IIncome> =
  mongoose.models.Income ?? mongoose.model<IIncome>("Income", IncomeSchema);

export default Income;
