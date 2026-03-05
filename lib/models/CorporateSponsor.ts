import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICorporateSponsor extends Document {
  companyName: string;
  totalContributed: number;
  logoUrl?: string;
  fiscalYear: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CorporateSponsorSchema = new Schema<ICorporateSponsor>(
  {
    companyName: { type: String, required: true, trim: true },
    totalContributed: { type: Number, default: 0, min: 0 },
    logoUrl: { type: String },
    fiscalYear: { type: String, default: "2025-26", index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CorporateSponsorSchema.index({ companyName: 1, fiscalYear: 1 }, { unique: true });

const CorporateSponsor: Model<ICorporateSponsor> =
  mongoose.models.CorporateSponsor ||
  mongoose.model<ICorporateSponsor>("CorporateSponsor", CorporateSponsorSchema);

export default CorporateSponsor;
