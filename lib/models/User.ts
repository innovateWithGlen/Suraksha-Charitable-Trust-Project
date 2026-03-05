import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: "admin" | "superadmin";
  image?: string;
  provider: "credentials" | "google";
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    phone: { type: String },
    role: { type: String, enum: ["admin", "superadmin"], default: "admin" },
    image: { type: String },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    emailVerified: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
