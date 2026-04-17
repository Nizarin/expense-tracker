import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomCategory extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  colorHex?: string;
}

const CustomCategorySchema = new Schema<ICustomCategory>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 50 },
  colorHex: { type: String, default: "#6366f1" },
});

// One user can't have two custom categories with the same name
CustomCategorySchema.index({ userId: 1, name: 1 }, { unique: true });

const CustomCategory: Model<ICustomCategory> =
  mongoose.models.CustomCategory ??
  mongoose.model<ICustomCategory>("CustomCategory", CustomCategorySchema);

export default CustomCategory;
