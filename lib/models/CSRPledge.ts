import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICSRPledge extends Document {
  projectId: mongoose.Types.ObjectId;
  companyName: string;
  amount: number;
  status: "pledged" | "confirmed" | "cancelled";
  contactName?: string;
  contactEmail?: string;
  notes?: string;
  fiscalYear: string;
  createdAt: Date;
  updatedAt: Date;
}

const CSRPledgeSchema = new Schema<ICSRPledge>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "CSRProject", required: true },
    companyName: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["pledged", "confirmed", "cancelled"],
      default: "pledged",
      required: true,
    },
    contactName: { type: String },
    contactEmail: { type: String, lowercase: true },
    notes: { type: String },
    fiscalYear: { type: String, default: "2025-26", index: true },
  },
  { timestamps: true }
);

CSRPledgeSchema.index({ projectId: 1, status: 1 });
CSRPledgeSchema.index({ companyName: 1, createdAt: -1 });

const CSRPledge: Model<ICSRPledge> =
  mongoose.models.CSRPledge ||
  mongoose.model<ICSRPledge>("CSRPledge", CSRPledgeSchema);

export default CSRPledge;
