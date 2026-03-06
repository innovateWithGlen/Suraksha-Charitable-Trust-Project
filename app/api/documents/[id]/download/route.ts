import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import TrustDocument from "@/lib/models/TrustDocument";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const doc = await TrustDocument.findById(id)
      .select("title filename fileType mimeType fileData")
      .lean();

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (doc.fileType !== "pdf" || !doc.fileData) {
      return NextResponse.json({ error: "PDF file not available" }, { status: 404 });
    }

    const safeFilename = (doc.filename || `${doc.title}.pdf`).replace(/[^a-zA-Z0-9._-]/g, "_");

    return new NextResponse(doc.fileData as Buffer, {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType || "application/pdf",
        "Content-Disposition": `inline; filename=\"${safeFilename}\"`,
        "Cache-Control": "private, max-age=0, no-store",
      },
    });
  } catch (error) {
    console.error("GET /api/documents/[id]/download error", error);
    return NextResponse.json({ error: "Failed to download document" }, { status: 500 });
  }
}
