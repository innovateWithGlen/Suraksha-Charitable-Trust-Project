import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Donation, Donor } from "@/lib/models";
import { donationUpdateSchema } from "@/lib/validations";

// GET /api/donations/[id]
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
    const donation = await Donation.findById(id).lean();

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    return NextResponse.json({ donation });
  } catch (error) {
    console.error("GET /api/donations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch donation" },
      { status: 500 }
    );
  }
}

// PUT /api/donations/[id]
export async function PUT(
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
    const body = await request.json();
    const validated = donationUpdateSchema.parse(body);

    const donation = await Donation.findById(id);
    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    // If marking as completed, update donor stats
    if (validated.status === "completed" && donation.status !== "completed") {
      await Donor.findByIdAndUpdate(donation.donorId, {
        $inc: { totalDonated: donation.amount, donationCount: 1 },
        $set: { lastDonationDate: new Date(), status: "active" },
      });
    }

    // If un-completing (refund), revert donor stats
    if (validated.status === "refunded" && donation.status === "completed") {
      await Donor.findByIdAndUpdate(donation.donorId, {
        $inc: { totalDonated: -donation.amount, donationCount: -1 },
      });
    }

    const updated = await Donation.findByIdAndUpdate(
      id,
      { $set: validated },
      { new: true }
    );

    return NextResponse.json({ donation: updated });
  } catch (error) {
    console.error("PUT /api/donations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update donation" },
      { status: 500 }
    );
  }
}

// DELETE /api/donations/[id]
export async function DELETE(
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
    const donation = await Donation.findByIdAndDelete(id);

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Donation deleted" });
  } catch (error) {
    console.error("DELETE /api/donations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete donation" },
      { status: 500 }
    );
  }
}
