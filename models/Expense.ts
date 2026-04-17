import mongoose, { Schema, Document, Model } from "mongoose";
import { CATEGORIES, Category } from "@/lib/categories";

export { CATEGORIES };
export type { Category };

export interface IExpense extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number; // stored in paise (1 INR = 100 paise)
  category: Category;
  note?: string;
  date: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    category: { type: String, required: true }, // default or custom
    note: { type: String, trim: true, maxlength: 200 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const Expense: Model<IExpense> =
  mongoose.models.Expense ?? mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;
