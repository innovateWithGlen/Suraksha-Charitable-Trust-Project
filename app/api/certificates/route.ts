import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Certificate } from "@/lib/models";

// GET /api/certificates - List certificates
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const donorId = searchParams.get("donorId");
    const donationId = searchParams.get("donationId");

    const query: Record<string, unknown> = {};
    if (donorId) query.donorId = donorId;
    if (donationId) query.donationId = donationId;

    const certificates = await Certificate.find(query)
      .sort({ generatedAt: -1 })
      .lean();

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error("GET /api/certificates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}
