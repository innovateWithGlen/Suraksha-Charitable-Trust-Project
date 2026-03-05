import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGalleryImage {
  url: string;
  caption?: string;
}

export interface IGalleryEvent extends Document {
  title: string;
  category: "education" | "healthcare" | "environment" | "community" | "events" | "other";
  date: Date;
  location: string;
  description?: string;
  images: IGalleryImage[];
  isActive: boolean;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryEventSchema = new Schema<IGalleryEvent>(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["education", "healthcare", "environment", "community", "events", "other"],
      required: true,
    },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    description: { type: String },
    images: [
      {
        url: { type: String, required: true },
        caption: { type: String },
      },
    ],
    isActive: { type: Boolean, default: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

GalleryEventSchema.index({ category: 1 });
GalleryEventSchema.index({ date: -1 });

const GalleryEvent: Model<IGalleryEvent> =
  mongoose.models.GalleryEvent ||
  mongoose.model<IGalleryEvent>("GalleryEvent", GalleryEventSchema);

export default GalleryEvent;
