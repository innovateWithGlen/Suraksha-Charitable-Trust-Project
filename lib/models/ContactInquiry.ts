import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContactInquiry extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  repliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContactInquirySchema = new Schema<IContactInquiry>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "read", "replied"],
      default: "new",
    },
    repliedAt: { type: Date },
  },
  { timestamps: true }
);

ContactInquirySchema.index({ status: 1 });
ContactInquirySchema.index({ createdAt: -1 });

const ContactInquiry: Model<IContactInquiry> =
  mongoose.models.ContactInquiry ||
  mongoose.model<IContactInquiry>("ContactInquiry", ContactInquirySchema);

export default ContactInquiry;
