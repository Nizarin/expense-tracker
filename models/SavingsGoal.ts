import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISavingsGoal extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  targetAmount: number; // in paise
  currentAmount: number; // in paise
  deadline: Date;
  isCompleted: boolean;
  createdAt: Date;
}

const SavingsGoalSchema = new Schema<ISavingsGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    targetAmount: { type: Number, required: true, min: 1 },
    currentAmount: { type: Number, default: 0, min: 0 },
    deadline: { type: Date, required: true },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

const SavingsGoal: Model<ISavingsGoal> =
  mongoose.models.SavingsGoal ??
  mongoose.model<ISavingsGoal>("SavingsGoal", SavingsGoalSchema);

export default SavingsGoal;
