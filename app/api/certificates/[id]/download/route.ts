import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Certificate } from "@/lib/models";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const certificate = await Certificate.findById(id)
      .select("certificateNumber pdfBase64")
      .lean();

    if (!certificate || !certificate.pdfBase64) {
      return NextResponse.json({ error: "Receipt file not found" }, { status: 404 });
    }

    const buffer = Buffer.from(certificate.pdfBase64, "base64");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=\"${certificate.certificateNumber}.pdf\"`,
        "Cache-Control": "private, max-age=0, no-store",
      },
    });
  } catch (error) {
    console.error("GET /api/certificates/[id]/download error:", error);
    return NextResponse.json(
      { error: "Failed to download receipt" },
      { status: 500 }
    );
  }
}
