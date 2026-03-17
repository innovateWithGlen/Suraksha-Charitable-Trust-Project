import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICertificate extends Document {
  donationId: mongoose.Types.ObjectId;
  donorId: mongoose.Types.ObjectId;
  certificateNumber: string;
  pdfUrl: string;
  type: "auto" | "manual";
  donorName: string;
  donorPan?: string;
  donorIdType?: "aadhaar" | "passport" | "voterId";
  donorIdNumber?: string;
  amount: number;
  donationDate: Date;
  generatedAt: Date;
  urnUsed: string;
  receiptSent: boolean;
  receiptSentAt?: Date;
  resendCount: number;
  lastResentAt?: Date;
  blobPath?: string;
  pdfBase64?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    donationId: {
      type: Schema.Types.ObjectId,
      ref: "Donation",
      required: true,
    },
    donorId: { type: Schema.Types.ObjectId, ref: "Donor", required: true },
    certificateNumber: { type: String, required: true, unique: true },
    pdfUrl: { type: String, required: true },
    type: { type: String, enum: ["auto", "manual"], default: "auto" },
    donorName: { type: String, required: true },
    donorPan: { type: String },
    donorIdType: { type: String, enum: ["aadhaar", "passport", "voterId"] },
    donorIdNumber: { type: String },
    amount: { type: Number, required: true },
    donationDate: { type: Date, required: true },
    generatedAt: { type: Date, default: Date.now },
    urnUsed: { type: String, required: true },
    receiptSent: { type: Boolean, default: false },
    receiptSentAt: { type: Date },
    resendCount: { type: Number, default: 0 },
    lastResentAt: { type: Date },
    blobPath: { type: String },
    pdfBase64: { type: String },
  },
  { timestamps: true }
);

CertificateSchema.index({ donationId: 1 });
CertificateSchema.index({ donorId: 1 });

const Certificate: Model<ICertificate> =
  mongoose.models.Certificate ||
  mongoose.model<ICertificate>("Certificate", CertificateSchema);

export default Certificate;
