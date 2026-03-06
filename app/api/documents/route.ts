import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import TrustDocument from "@/lib/models/TrustDocument";
import { chunkText } from "@/lib/rag/chunk";
import { createEmbeddings } from "@/lib/rag/embeddings";

async function dropLegacyEmbeddingGeoIndex() {
  try {
    const indexes = await TrustDocument.collection.indexes();
    const badIndex = indexes.find((idx) => idx.name === "chunks.embedding_2dsphere");
    if (badIndex) {
      await TrustDocument.collection.dropIndex("chunks.embedding_2dsphere");
      console.info("Dropped legacy index chunks.embedding_2dsphere");
    }
  } catch (error) {
    // Non-fatal: upload should continue even if index inspection fails.
    console.warn("Could not inspect/drop legacy embedding index", error);
  }
}

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const parserModule = await import("pdf-parse");
  const PDFParse = (parserModule as { PDFParse: new (options: { data: Buffer }) => { getText: () => Promise<{ text: string }>; destroy: () => Promise<void> } }).PDFParse;

  const parser = new PDFParse({ data: buffer });
  try {
    const parsed = await parser.getText();
    return (parsed?.text || "").trim();
  } finally {
    await parser.destroy();
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    await dropLegacyEmbeddingGeoIndex();
    const docs = await TrustDocument.find({})
      .select("title filename fileType mimeType fileSize totalChunks isActive createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      documents: docs.map((doc) => ({
        _id: doc._id,
        title: doc.title,
        filename: doc.filename,
        fileType: doc.fileType,
        mimeType: doc.mimeType,
        fileSize: doc.fileSize,
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

    const contentType = req.headers.get("content-type") || "";

    let title = "";
    let content = "";
    let filename = "manual-entry.txt";
    let fileType: "pdf" | "text" | "markdown" = "text";
    let mimeType: string | undefined;
    let fileSize: number | undefined;
    let fileData: Buffer | undefined;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      const formTitle = form.get("title");
      const formContent = form.get("content");

      title = typeof formTitle === "string" ? formTitle.trim() : "";
      content = typeof formContent === "string" ? formContent : "";

      if (file instanceof File) {
        if (file.type !== "application/pdf") {
          return NextResponse.json({ error: "Only PDF uploads are supported" }, { status: 400 });
        }

        filename = file.name || "document.pdf";
        fileType = "pdf";
        mimeType = file.type;
        fileSize = file.size;
        const arrayBuffer = await file.arrayBuffer();
        fileData = Buffer.from(arrayBuffer);

        try {
          const extracted = await extractTextFromPdf(fileData);
          content = extracted;
        } catch (pdfError) {
          console.error("PDF text extraction failed", pdfError);
          return NextResponse.json(
            { error: "Failed to read this PDF. Please upload a text-based PDF or paste content manually." },
            { status: 400 }
          );
        }

        if (!title) {
          title = filename.replace(/\.pdf$/i, "");
        }
      }
    } else {
      const body = await req.json();
      title = body.title || "";
      content = body.content || "";
      filename = body.filename || "manual-entry.txt";
      fileType = body.fileType || "text";
      mimeType = body.mimeType;
      fileSize = body.fileSize;
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: "title and content are required. For PDFs, ensure the file contains selectable text." },
        { status: 400 }
      );
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
      mimeType,
      fileSize,
      fileData,
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
    const message = error instanceof Error ? error.message : "Failed to ingest document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
