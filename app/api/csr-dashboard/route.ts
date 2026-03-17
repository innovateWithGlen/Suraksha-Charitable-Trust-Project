import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { CSRProject, CorporateSponsor, CSRPledge, CSRExpense } from "@/lib/models";

export async function GET() {
  try {
    await dbConnect();

    const [projects, sponsors, pledges, expenses, categoryBreakdown] = await Promise.all([
      CSRProject.find({ fiscalYear: "2025-26" }).lean(),
      CorporateSponsor.find({ fiscalYear: "2025-26", isActive: true })
        .sort({ totalContributed: -1 })
        .lean(),
      CSRPledge.find({ fiscalYear: "2025-26" }).lean(),
      CSRExpense.find({}).lean(),
      CSRProject.aggregate([
        { $match: { fiscalYear: "2025-26" } },
        {
          $group: {
            _id: "$category",
            goalAmount: { $sum: "$goalAmount" },
            raisedAmount: { $sum: "$raisedAmount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const totalBudget = pledges
      .filter((pledge) => pledge.status !== "cancelled")
      .reduce((sum, pledge) => sum + (pledge.amount || 0), 0);

    const utilizedFunds = expenses.reduce((sum, expense) => sum + (expense.amountPaid || 0), 0);
    const remainingFunds = Math.max(totalBudget - utilizedFunds, 0);

    const byStatus = projects.reduce(
      (acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const impact = {
      livesImpacted: projects.reduce((sum, project) => sum + (project.livesImpacted || 0), 0),
      beneficiariesCount: projects.reduce((sum, project) => sum + (project.beneficiariesCount || 0), 0),
      activeProjects: projects.filter((project) => project.status === "Open").length,
      fundedProjects: projects.filter((project) => project.status === "Funded").length,
      pledgesCount: pledges.length,
    };

    return NextResponse.json({
      fiscalYear: "2025-26",
      totalCSRFund: totalBudget,
      utilizedFunds,
      remainingFunds,
      projectsCount: projects.length,
      byStatus,
      categoryBreakdown,
      topSponsors: sponsors.slice(0, 8),
      impact,
      compliance: {
        eightyG: true,
        twelveA: true,
        csr1: true,
      },
    });
  } catch (error) {
    console.error("GET /api/csr-dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch CSR dashboard" }, { status: 500 });
  }
}
