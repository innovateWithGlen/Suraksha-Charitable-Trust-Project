import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBlobTokenInfo, getBlobTokenValidation, getExpenseBlobAccess } from "@/lib/blob";
import dbConnect from "@/lib/mongodb";
import { CSRExpense, CSRProject } from "@/lib/models";
import { recomputeProjectUtilizedAmount } from "@/lib/csr-helpers";
import { csrExpenseSchema } from "@/lib/validations";

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

    const expenses = await CSRExpense.find({ projectId: id })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error("GET /api/csr-projects/[id]/expenses error:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(
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

    const project = await CSRProject.findById(id).lean();
    if (!project) {
      return NextResponse.json({ error: "CSR project not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const details = String(formData.get("details") || "").trim();
    const amountPaid = Number(formData.get("amountPaid") || 0);
    const date = String(formData.get("date") || new Date().toISOString());
    const billFile = formData.get("billDocument") as File | null;

    if (!billFile || !(billFile instanceof File)) {
      return NextResponse.json({ error: "Bill document file is required" }, { status: 400 });
    }

    const blobValidation = getBlobTokenValidation();
    if (!blobValidation.ok) {
      return NextResponse.json(
        {
          error: blobValidation.error,
        },
        { status: 500 }
      );
    }

    const tokenInfo = getBlobTokenInfo();
    if (!tokenInfo?.token) {
      return NextResponse.json(
        {
          error: "Blob storage is not configured. Missing Blob read/write token in runtime.",
        },
        { status: 500 }
      );
    }

    const filename = `csr-expenses/${id}/${Date.now()}-${billFile.name}`;
    const uploaded = await put(filename, billFile, {
      token: tokenInfo.token,
      access: getExpenseBlobAccess(),
      addRandomSuffix: true,
      contentType: billFile.type || "application/octet-stream",
    });

    const validated = csrExpenseSchema.parse({
      projectId: id,
      amountPaid,
      details,
      date,
      billDocumentUrl: uploaded.url,
    });

    const expense = await CSRExpense.create({
      ...validated,
      projectId: id,
      createdBy: (session.user as any)?.id,
    });

    await recomputeProjectUtilizedAmount(id);

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/csr-projects/[id]/expenses error:", error);
    if (error?.name === "ZodError") {
      const firstIssue = error.errors?.[0];
      const field = Array.isArray(firstIssue?.path) ? firstIssue.path.join(".") : undefined;
      const message = firstIssue?.message || "Validation failed";
      return NextResponse.json(
        {
          error: field ? `${field}: ${message}` : message,
          details: error.errors,
        },
        { status: 400 }
      );
    }
    if (typeof error?.message === "string" && error.message.toLowerCase().includes("blob")) {
      return NextResponse.json(
        {
          error: `Blob storage error: ${error.message}. Visit /api/debug/blob (while signed in) for a step-by-step diagnosis.`,
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
