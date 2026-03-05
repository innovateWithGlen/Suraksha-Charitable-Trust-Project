import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICSRProject extends Document {
  title: string;
  description: string;
  category: "Health" | "Education" | "Empowerment" | "Environment";
  goalAmount: number;
  raisedAmount: number;
  coverImageUrl?: string;
  status: "Open" | "Funded" | "Closed";
  fiscalYear: string;
  livesImpacted: number;
  beneficiariesCount: number;
  location?: string;
  isFeatured: boolean;
  csr1Tracking?: string;
  sponsoringCompanies: mongoose.Types.ObjectId[];
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CSRProjectSchema = new Schema<ICSRProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["Health", "Education", "Empowerment", "Environment"],
      required: true,
    },
    goalAmount: { type: Number, required: true, min: 1 },
    raisedAmount: { type: Number, default: 0, min: 0 },
    coverImageUrl: { type: String },
    status: {
      type: String,
      enum: ["Open", "Funded", "Closed"],
      default: "Open",
      required: true,
    },
    fiscalYear: { type: String, default: "2025-26", index: true },
    livesImpacted: { type: Number, default: 0 },
    beneficiariesCount: { type: Number, default: 0 },
    location: { type: String },
    isFeatured: { type: Boolean, default: false },
    csr1Tracking: { type: String, default: "CSR-1 Registered" },
    sponsoringCompanies: [
      { type: Schema.Types.ObjectId, ref: "CorporateSponsor" },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

CSRProjectSchema.index({ status: 1, category: 1 });
CSRProjectSchema.index({ title: "text", description: "text", location: "text" });

const CSRProject: Model<ICSRProject> =
  mongoose.models.CSRProject ||
  mongoose.model<ICSRProject>("CSRProject", CSRProjectSchema);

export default CSRProject;
