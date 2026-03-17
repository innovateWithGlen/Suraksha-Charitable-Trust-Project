import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { CSRExpense, CSRProject } from "@/lib/models";
import { recomputeProjectUtilizedAmount } from "@/lib/csr-helpers";
import { csrExpenseSchema } from "@/lib/validations";

function hasValidBlobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return false;
  }

  const normalized = token.trim();
  if (!normalized) {
    return false;
  }

  // Reject the example placeholder so uploads fail with a useful message.
  if (normalized.includes("your_real_token")) {
    return false;
  }

  return true;
}

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

    if (!hasValidBlobToken()) {
      return NextResponse.json(
        {
          error: "Blob storage is not configured. Set a valid BLOB_READ_WRITE_TOKEN in .env.local and restart the dev server.",
        },
        { status: 500 }
      );
    }

    const filename = `csr-expenses/${id}/${Date.now()}-${billFile.name}`;
    const uploaded = await put(filename, billFile, {
      access: "public",
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
        { error: "Blob storage is not configured correctly. Please check the Vercel Blob token." },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
