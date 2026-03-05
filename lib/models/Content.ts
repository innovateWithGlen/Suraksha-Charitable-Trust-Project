import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContent extends Document {
  type: "faq" | "program" | "hero" | "testimonial" | "partner" | "about" | "cta";
  title: string;
  subtitle?: string;
  content: string;
  image?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  metadata?: Record<string, unknown>;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContent>(
  {
    type: {
      type: String,
      enum: ["faq", "program", "hero", "testimonial", "partner", "about", "cta"],
      required: true,
    },
    title: { type: String, required: true },
    subtitle: { type: String },
    content: { type: String, required: true },
    image: { type: String },
    icon: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ContentSchema.index({ type: 1, order: 1 });
ContentSchema.index({ type: 1, isActive: 1 });

const Content: Model<IContent> =
  mongoose.models.Content ||
  mongoose.model<IContent>("Content", ContentSchema);

export default Content;
