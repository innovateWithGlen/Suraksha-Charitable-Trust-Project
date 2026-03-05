import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";

export interface IOTP extends Document {
  email: string;
  otp: string; // hashed
  expiresAt: Date;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>({
  email: { type: String, required: true, lowercase: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
  createdAt: { type: Date, default: Date.now },
});

OTPSchema.index({ email: 1 });

// Static method to hash OTP
OTPSchema.statics.hashOTP = function (otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

const OTP: Model<IOTP> =
  mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema);

export default OTP;
