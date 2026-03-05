import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDonor extends Document {
  name: string;
  email: string;
  phone: string;
  panNumber?: string; // encrypted
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  totalDonated: number;
  donationCount: number;
  status: "active" | "inactive";
  lastDonationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DonorSchema = new Schema<IDonor>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    panNumber: { type: String }, // stored encrypted
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    totalDonated: { type: Number, default: 0 },
    donationCount: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    lastDonationDate: { type: Date },
  },
  { timestamps: true }
);

DonorSchema.index({ email: 1 });
DonorSchema.index({ phone: 1 });
DonorSchema.index({ name: "text", email: "text" });

const Donor: Model<IDonor> =
  mongoose.models.Donor || mongoose.model<IDonor>("Donor", DonorSchema);

export default Donor;
