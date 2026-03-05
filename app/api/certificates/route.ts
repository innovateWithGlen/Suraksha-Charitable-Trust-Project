import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Certificate, Donation } from "@/lib/models";

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
    const search = searchParams.get("search");

    const query: Record<string, unknown> = {};
    if (donorId) query.donorId = donorId;
    if (donationId) query.donationId = donationId;
    if (search) {
      query.$or = [
        { donorName: { $regex: search, $options: "i" } },
        { certificateNumber: { $regex: search, $options: "i" } },
      ];
    }

    const certificates = await Certificate.find(query)
      .select("-pdfBase64")
      .sort({ generatedAt: -1 })
      .lean();

    const donationIds = certificates.map((certificate) => String(certificate.donationId));
    const relatedDonations = await Donation.find({ _id: { $in: donationIds } })
      .select("_id donorEmail transactionId")
      .lean();

    const donationMap = new Map(
      relatedDonations.map((donation) => [String(donation._id), donation])
    );

    const enriched = certificates.map((certificate) => {
      const related = donationMap.get(String(certificate.donationId));
      return {
        ...certificate,
        donorEmail: related?.donorEmail,
        transactionId: related?.transactionId,
        timestamp: certificate.generatedAt,
      };
    });

    return NextResponse.json({ certificates: enriched, total: enriched.length });
  } catch (error) {
    console.error("GET /api/certificates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}
