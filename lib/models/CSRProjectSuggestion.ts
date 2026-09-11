import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICSRProjectSuggestion extends Document {
  projectName: string;
  category: string;
  description: string;
  location?: string;
  estimatedBudget?: number;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  companyName: string;
  status: "pending" | "reviewed" | "approved" | "rejected";
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CSRProjectSuggestionSchema = new Schema<ICSRProjectSuggestion>(
  {
    projectName: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: { type: String, required: true },
    location: { type: String },
    estimatedBudget: { type: Number, min: 0 },
    contactName: { type: String, required: true },
    contactEmail: { type: String, required: true, lowercase: true },
    contactPhone: { type: String },
    companyName: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "reviewed", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

CSRProjectSuggestionSchema.index({ status: 1 });
CSRProjectSuggestionSchema.index({ createdAt: -1 });

const CSRProjectSuggestion: Model<ICSRProjectSuggestion> =
  mongoose.models.CSRProjectSuggestion ||
  mongoose.model<ICSRProjectSuggestion>(
    "CSRProjectSuggestion",
    CSRProjectSuggestionSchema
  );

export default CSRProjectSuggestion;
