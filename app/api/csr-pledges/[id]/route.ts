import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { CSRPledge } from "@/lib/models";
import {
  recomputeProjectRaisedAmount,
  upsertCorporateSponsorContribution,
} from "@/lib/csr-helpers";

const ALLOWED_PLEDGE_STATUS = new Set(["pledged", "confirmed", "cancelled"]);

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

    const pledge = await CSRPledge.findById(id);
    if (!pledge) {
      return NextResponse.json({ error: "Pledge not found" }, { status: 404 });
    }

    const prevStatus = pledge.status;

    if (typeof body.status === "string") {
      if (!ALLOWED_PLEDGE_STATUS.has(body.status)) {
        return NextResponse.json({ error: "Invalid pledge status" }, { status: 400 });
      }
      pledge.status = body.status;
    }
    if (typeof body.notes === "string") {
      pledge.notes = body.notes;
    }

    if (prevStatus !== "confirmed" && pledge.status === "confirmed") {
      pledge.confirmationDate = new Date();
    }
    if (prevStatus === "confirmed" && pledge.status !== "confirmed") {
      pledge.confirmationDate = undefined;
    }

    await pledge.save();

    if (prevStatus !== "confirmed" && pledge.status === "confirmed") {
      await upsertCorporateSponsorContribution({
        companyName: pledge.companyName,
        fiscalYear: pledge.fiscalYear || "2025-26",
        amount: pledge.amount,
      });
    }

    await recomputeProjectRaisedAmount(String(pledge.projectId));

    return NextResponse.json({ pledge });
  } catch (error) {
    console.error("PUT /api/csr-pledges/[id] error:", error);
    return NextResponse.json({ error: "Failed to update pledge" }, { status: 500 });
  }
}
