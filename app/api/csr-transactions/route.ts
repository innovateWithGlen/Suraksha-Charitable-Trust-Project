import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { CSRExpense, CSRPledge, Donation } from "@/lib/models";

type TransactionItem = {
  id: string;
  date: string;
  type: "pledge" | "expense" | "transfer";
  projectName: string;
  entity: string;
  amount: number;
  status?: string;
  billDocumentUrl?: string;
};

function parseTransferMeta(notes?: string) {
  if (!notes?.startsWith("CSR_INTERNAL_TRANSFER|")) return null;

  const rawParts = notes.split("|").slice(1);
  const map: Record<string, string> = {};

  for (const part of rawParts) {
    const [key, ...rest] = part.split("=");
    if (!key) continue;
    map[key] = rest.join("=");
  }

  return {
    projectTitle: map.projectTitle || "Deleted CSR Project",
    note: map.note || "",
  };
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 50), 1), 200);

    const [pledges, expenses, transfers] = await Promise.all([
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
      Donation.find({ notes: { $regex: /^CSR_INTERNAL_TRANSFER\|/ } })
        .sort({ createdAt: -1 })
        .limit(limit)
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

    const transferRows: TransactionItem[] = transfers
      .map((transfer: any) => {
        const meta = parseTransferMeta(transfer.notes);
        if (!meta) return null;

        return {
          id: `transfer-${transfer._id}`,
          date: new Date(transfer.createdAt).toISOString(),
          type: "transfer" as const,
          projectName: meta.projectTitle,
          entity: meta.note ? `Internal transfer • ${meta.note}` : "Internal transfer to total donations",
          amount: Number(transfer.amount || 0),
          status: transfer.status,
        };
      })
      .filter(Boolean) as TransactionItem[];

    const transactions = [...pledgeRows, ...expenseRows, ...transferRows]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("GET /api/csr-transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch CSR transactions" }, { status: 500 });
  }
}
