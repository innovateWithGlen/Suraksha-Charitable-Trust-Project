import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDocumentChunk {
  text: string;
  embedding: number[];
  chunkIndex: number;
}

export interface ITrustDocument extends Document {
  title: string;
  filename: string;
  fileUrl?: string;
  fileType: "pdf" | "text" | "markdown";
  chunks: IDocumentChunk[];
  totalChunks: number;
  uploadedBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentChunkSchema = new Schema<IDocumentChunk>(
  {
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
    chunkIndex: { type: Number, required: true },
  },
  { _id: true }
);

const TrustDocumentSchema = new Schema<ITrustDocument>(
  {
    title: { type: String, required: true },
    filename: { type: String, required: true },
    fileUrl: { type: String },
    fileType: {
      type: String,
      enum: ["pdf", "text", "markdown"],
      default: "text",
    },
    chunks: [DocumentChunkSchema],
    totalChunks: { type: Number, default: 0 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TrustDocumentSchema.index({ isActive: 1 });
TrustDocumentSchema.index({ "chunks.embedding": "2dsphere" });

const TrustDocument: Model<ITrustDocument> =
  mongoose.models.TrustDocument ||
  mongoose.model<ITrustDocument>("TrustDocument", TrustDocumentSchema);

export default TrustDocument;
