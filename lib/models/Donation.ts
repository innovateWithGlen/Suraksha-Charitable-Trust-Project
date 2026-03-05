import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDonation extends Document {
  donorId: mongoose.Types.ObjectId;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  amount: number;
  method: "upi" | "card" | "netbanking" | "wallet" | "other";
  requires80G: boolean;
  status: "pending" | "completed" | "success" | "failed" | "refunded";
  transactionId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  receiptGenerated: boolean;
  receiptSent: boolean;
  receiptSentAt?: Date;
  urnUsed?: string;
  receiptTimestamp?: Date;
  notificationRead: boolean;
  notificationReadAt?: Date;
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
      enum: ["pending", "completed", "success", "failed", "refunded"],
      default: "pending",
    },
    transactionId: { type: String, required: true, unique: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    receiptGenerated: { type: Boolean, default: false },
    receiptSent: { type: Boolean, default: false },
    receiptSentAt: { type: Date },
    urnUsed: { type: String },
    receiptTimestamp: { type: Date },
    notificationRead: { type: Boolean, default: false },
    notificationReadAt: { type: Date },
    certificateUrl: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

DonationSchema.index({ donorId: 1 });
DonationSchema.index({ status: 1 });
DonationSchema.index({ createdAt: -1 });
DonationSchema.index({ notificationRead: 1, status: 1, createdAt: -1 });

const Donation: Model<IDonation> =
  mongoose.models.Donation ||
  mongoose.model<IDonation>("Donation", DonationSchema);

export default Donation;
