import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICSRExpense extends Document {
  projectId: mongoose.Types.ObjectId;
  amountPaid: number;
  details: string;
  date: Date;
  billDocumentUrl?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CSRExpenseSchema = new Schema<ICSRExpense>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "CSRProject", required: true },
    amountPaid: { type: Number, required: true, min: 1 },
    details: { type: String, required: true, trim: true },
    date: { type: Date, required: true, default: Date.now },
    billDocumentUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

CSRExpenseSchema.index({ projectId: 1, date: -1 });
CSRExpenseSchema.index({ createdAt: -1 });

const CSRExpense: Model<ICSRExpense> =
  mongoose.models.CSRExpense ||
  mongoose.model<ICSRExpense>("CSRExpense", CSRExpenseSchema);

export default CSRExpense;
