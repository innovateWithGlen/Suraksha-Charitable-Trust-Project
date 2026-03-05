import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDonation extends Document {
  donorId: mongoose.Types.ObjectId;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  amount: number;
  method: "upi" | "card" | "netbanking" | "wallet" | "other";
  requires80G: boolean;
  status: "pending" | "completed" | "failed" | "refunded";
  transactionId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  receiptGenerated: boolean;
  certificateUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>(
  {
    donorId: { type: Schema.Types.ObjectId, ref: "Donor", required: true },
    donorName: { type: String, required: true },
    donorEmail: { type: String, required: true },
    donorPhone: { type: String },
    amount: { type: Number, required: true, min: 100 },
    method: {
      type: String,
      enum: ["upi", "card", "netbanking", "wallet", "other"],
      default: "other",
    },
    requires80G: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: { type: String, required: true, unique: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    receiptGenerated: { type: Boolean, default: false },
    certificateUrl: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

DonationSchema.index({ donorId: 1 });
DonationSchema.index({ status: 1 });
DonationSchema.index({ createdAt: -1 });
DonationSchema.index({ transactionId: 1 });

const Donation: Model<IDonation> =
  mongoose.models.Donation ||
  mongoose.model<IDonation>("Donation", DonationSchema);

export default Donation;
