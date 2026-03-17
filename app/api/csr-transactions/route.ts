import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { CSRExpense, CSRPledge } from "@/lib/models";

type TransactionItem = {
  id: string;
  date: string;
  type: "pledge" | "expense";
  projectName: string;
  entity: string;
  amount: number;
  status?: string;
  billDocumentUrl?: string;
};

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 50), 1), 200);

    const [pledges, expenses] = await Promise.all([
      CSRPledge.find({ status: { $in: ["pledged", "confirmed", "cancelled"] } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("projectId", "title")
        .lean(),
      CSRExpense.find({})
        .sort({ date: -1, createdAt: -1 })
        .limit(limit)
        .populate("projectId", "title")
        .lean(),
    ]);

    const pledgeRows: TransactionItem[] = pledges.map((pledge: any) => ({
      id: `pledge-${pledge._id}`,
      date: new Date(pledge.createdAt).toISOString(),
      type: "pledge",
      projectName: pledge.projectId?.title || "Unknown Project",
      entity: pledge.companyName,
      amount: Number(pledge.amount || 0),
      status: pledge.status,
    }));

    const expenseRows: TransactionItem[] = expenses.map((expense: any) => ({
      id: `expense-${expense._id}`,
      date: new Date(expense.date || expense.createdAt).toISOString(),
      type: "expense",
      projectName: expense.projectId?.title || "Unknown Project",
      entity: expense.details,
      amount: -Math.abs(Number(expense.amountPaid || 0)),
      billDocumentUrl: expense.billDocumentUrl || undefined,
    }));

    const transactions = [...pledgeRows, ...expenseRows]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("GET /api/csr-transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch CSR transactions" }, { status: 500 });
  }
}
