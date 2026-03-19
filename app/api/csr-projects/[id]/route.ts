import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { CSRExpense, CSRPledge, CSRProject, Donation, Donor } from "@/lib/models";
import { csrProjectUpdateSchema } from "@/lib/validations";
import crypto from "crypto";

function createInternalTransferTxnId() {
  return `CSR-XFER-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const project = await CSRProject.findById(id)
      .populate("sponsoringCompanies", "companyName logoUrl totalContributed")
      .lean();

    if (!project) {
      return NextResponse.json({ error: "CSR project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("GET /api/csr-projects/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch CSR project" }, { status: 500 });
  }
}

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
    const validated = csrProjectUpdateSchema.parse(body);

    const project = await CSRProject.findByIdAndUpdate(
      id,
      {
        $set: {
          ...validated,
          ...(validated.coverImageUrl === "" && { coverImageUrl: undefined }),
        },
      },
      { new: true, runValidators: true }
    ).lean();

    if (!project) {
      return NextResponse.json({ error: "CSR project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error("PUT /api/csr-projects/[id] error:", error);
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update CSR project" }, { status: 500 });
  }
}

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
    const body = await request.json().catch(() => ({}));

    const forceCloseAndTransfer = Boolean(body?.forceCloseAndTransfer);
    const closureNote = typeof body?.closureNote === "string" ? body.closureNote.trim() : "";
    const transferAmount = Number(body?.transferAmount || 0);

    const [project, expenseCount, pledgeCount] = await Promise.all([
      CSRProject.findById(id).lean(),
      CSRExpense.countDocuments({ projectId: id }),
      CSRPledge.countDocuments({ projectId: id }),
    ]);

    if (!project) {
      return NextResponse.json({ error: "CSR project not found" }, { status: 404 });
    }

    const hasLinkedRecords = expenseCount > 0 || pledgeCount > 0;

    if (hasLinkedRecords && !forceCloseAndTransfer) {
      return NextResponse.json(
        {
          error: "This project cannot be deleted because it already has linked expenses or pledges. Close it instead.",
          canForceClose: true,
          raisedAmount: Number(project.raisedAmount || 0),
        },
        { status: 409 }
      );
    }

    if (forceCloseAndTransfer) {
      const raisedAmount = Number(project.raisedAmount || 0);

      if (!closureNote || closureNote.length < 8) {
        return NextResponse.json(
          { error: "Provide a short closure note (minimum 8 characters)" },
          { status: 400 }
        );
      }

      if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
        return NextResponse.json(
          { error: "Transfer amount must be greater than 0" },
          { status: 400 }
        );
      }

      if (transferAmount > raisedAmount) {
        return NextResponse.json(
          { error: "Transfer amount cannot exceed raised amount" },
          { status: 400 }
        );
      }

      const internalDonorEmail = "internal.transfer@suraksha.trust";

      const internalDonor = await Donor.findOneAndUpdate(
        { email: internalDonorEmail },
        {
          $set: {
            name: "CSR Internal Transfer",
            phone: "+910000000000",
            status: "active",
          },
          $setOnInsert: {
            totalDonated: 0,
            donationCount: 0,
          },
        },
        { upsert: true, new: true }
      );

      const transferTransactionId = createInternalTransferTxnId();
      const projectTitle = String(project.title || "Unnamed Project");

      await Donation.create({
        donorId: internalDonor._id,
        donorName: "CSR Internal Transfer",
        donorEmail: internalDonorEmail,
        donorPhone: "+910000000000",
        amount: transferAmount,
        method: "other",
        requires80G: false,
        status: "completed",
        transactionId: transferTransactionId,
        notes: `CSR_INTERNAL_TRANSFER|projectId=${id}|projectTitle=${projectTitle}|note=${closureNote}`,
      });

      await Donor.findByIdAndUpdate(internalDonor._id, {
        $inc: { totalDonated: transferAmount, donationCount: 1 },
        $set: { lastDonationDate: new Date() },
      });
    }

    await CSRProject.findByIdAndDelete(id);

    return NextResponse.json({
      message: forceCloseAndTransfer
        ? "CSR project closed, transferred to total donations, and deleted"
        : "CSR project deleted",
    });
  } catch (error) {
    console.error("DELETE /api/csr-projects/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete CSR project" }, { status: 500 });
  }
}
