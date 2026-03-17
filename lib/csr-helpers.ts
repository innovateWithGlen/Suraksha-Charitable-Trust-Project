import mongoose from "mongoose";
import { CorporateSponsor, CSRExpense, CSRProject, CSRPledge } from "@/lib/models";

export async function recomputeProjectRaisedAmount(projectId: string) {
  const projectObjectId = new mongoose.Types.ObjectId(projectId);
  const confirmed = await CSRPledge.aggregate([
    { $match: { projectId: projectObjectId, status: "confirmed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const total = confirmed[0]?.total || 0;
  const project = await CSRProject.findById(projectId).lean();
  if (!project) return;

  const nextStatus =
    total >= project.goalAmount
      ? "Funded"
      : project.status === "Closed"
        ? "Closed"
        : "Open";

  await CSRProject.findByIdAndUpdate(projectId, {
    $set: { raisedAmount: total, status: nextStatus },
  });
}

export async function recomputeProjectUtilizedAmount(projectId: string) {
  const projectObjectId = new mongoose.Types.ObjectId(projectId);
  const expenses = await CSRExpense.aggregate([
    { $match: { projectId: projectObjectId } },
    { $group: { _id: null, total: { $sum: "$amountPaid" } } },
  ]);

  const utilized = expenses[0]?.total || 0;
  await CSRProject.findByIdAndUpdate(projectId, { $set: { utilizedAmount: utilized } });
}

export async function upsertCorporateSponsorContribution(input: {
  companyName: string;
  fiscalYear: string;
  amount: number;
}) {
  await CorporateSponsor.findOneAndUpdate(
    { companyName: input.companyName.trim(), fiscalYear: input.fiscalYear },
    {
      $inc: { totalContributed: input.amount },
      $setOnInsert: {
        isActive: true,
        logoUrl: "",
        fiscalYear: input.fiscalYear,
      },
    },
    { upsert: true, new: true }
  );
}
