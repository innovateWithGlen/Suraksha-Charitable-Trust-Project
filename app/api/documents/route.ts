import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import TrustDocument from "@/lib/models/TrustDocument";
import { chunkText } from "@/lib/rag/chunk";
import { createEmbeddings } from "@/lib/rag/embeddings";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const docs = await TrustDocument.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      documents: docs.map((doc) => ({
        _id: doc._id,
        title: doc.title,
        filename: doc.filename,
        fileType: doc.fileType,
        totalChunks: doc.totalChunks,
        isActive: doc.isActive,
        createdAt: doc.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/documents error", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, content, filename = "manual-entry.txt", fileType = "text" } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "title and content are required" }, { status: 400 });
    }

    await dbConnect();

    const chunks = chunkText(content);
    if (!chunks.length) {
      return NextResponse.json({ error: "Document content is empty" }, { status: 400 });
    }

    const embeddings = await createEmbeddings(chunks);
    const embeddedChunks = chunks.map((text, index) => ({
      text,
      embedding: embeddings[index],
      chunkIndex: index,
    }));

    const document = await TrustDocument.create({
      title,
      filename,
      fileType,
      chunks: embeddedChunks,
      totalChunks: embeddedChunks.length,
      uploadedBy: (session.user as any)?.id,
      isActive: true,
    });

    return NextResponse.json({
      document: {
        _id: document._id,
        title: document.title,
        totalChunks: document.totalChunks,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/documents error", error);
    return NextResponse.json({ error: "Failed to ingest document" }, { status: 500 });
  }
}
