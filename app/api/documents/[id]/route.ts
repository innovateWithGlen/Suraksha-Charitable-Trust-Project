import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import TrustDocument from "@/lib/models/TrustDocument";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { id } = await params;

    const deleted = await TrustDocument.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    return NextResponse.json({ message: "Document deleted" });
  } catch (error) {
    console.error("DELETE /api/documents/[id] error", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
