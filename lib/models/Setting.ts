import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISetting extends Document {
  key: string;
  value: string;
  category: "general" | "payment" | "notification" | "social" | "other";
  description?: string;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    category: {
      type: String,
      enum: ["general", "payment", "notification", "social", "other"],
      default: "general",
    },
    description: { type: String },
  },
  { timestamps: true }
);

SettingSchema.index({ category: 1 });

const Setting: Model<ISetting> =
  mongoose.models.Setting ||
  mongoose.model<ISetting>("Setting", SettingSchema);

export default Setting;
