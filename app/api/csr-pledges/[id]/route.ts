import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { CSRPledge, CSRProject, CorporateSponsor } from "@/lib/models";

async function recomputeProjectRaisedAmount(projectId: string) {
  const projectObjectId = new mongoose.Types.ObjectId(projectId);
  const confirmed = await CSRPledge.aggregate([
    { $match: { projectId: projectObjectId, status: "confirmed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const total = confirmed[0]?.total || 0;
  const project = await CSRProject.findById(projectId).lean();
  if (!project) return;

  const nextStatus = total >= project.goalAmount ? "Funded" : project.status === "Closed" ? "Closed" : "Open";
  await CSRProject.findByIdAndUpdate(projectId, {
    $set: { raisedAmount: total, status: nextStatus },
  });
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

    const pledge = await CSRPledge.findById(id);
    if (!pledge) {
      return NextResponse.json({ error: "Pledge not found" }, { status: 404 });
    }

    const prevStatus = pledge.status;

    if (typeof body.status === "string") {
      pledge.status = body.status;
    }
    if (typeof body.notes === "string") {
      pledge.notes = body.notes;
    }

    await pledge.save();

    if (prevStatus !== "confirmed" && pledge.status === "confirmed") {
      await CorporateSponsor.findOneAndUpdate(
        { companyName: pledge.companyName.trim(), fiscalYear: pledge.fiscalYear || "2025-26" },
        {
          $inc: { totalContributed: pledge.amount },
          $setOnInsert: {
            isActive: true,
            logoUrl: "",
            fiscalYear: pledge.fiscalYear || "2025-26",
          },
        },
        { upsert: true, new: true }
      );
    }

    await recomputeProjectRaisedAmount(String(pledge.projectId));

    return NextResponse.json({ pledge });
  } catch (error) {
    console.error("PUT /api/csr-pledges/[id] error:", error);
    return NextResponse.json({ error: "Failed to update pledge" }, { status: 500 });
  }
}
