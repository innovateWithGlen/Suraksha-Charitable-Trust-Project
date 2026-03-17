import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { CSRPledge, CSRProject } from "@/lib/models";
import {
  recomputeProjectRaisedAmount,
  upsertCorporateSponsorContribution,
} from "@/lib/csr-helpers";
import { csrPledgeSchema, paginationSchema } from "@/lib/validations";
import { sendCSRPledgeAdminNotification } from "@/lib/email";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);

    const params = paginationSchema.parse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      sort: searchParams.get("sort") || "createdAt",
      order: searchParams.get("order") || "desc",
    });

    const query: Record<string, unknown> = {};
    const projectId = searchParams.get("projectId");
    if (projectId) {
      query.projectId = projectId;
    }
    if (params.status) {
      query.status = params.status;
    }
    if (params.search) {
      query.companyName = { $regex: params.search, $options: "i" };
    }

    const sortObj: Record<string, 1 | -1> = {
      [params.sort || "createdAt"]: params.order === "asc" ? 1 : -1,
    };

    const [pledges, total] = await Promise.all([
      CSRPledge.find(query)
        .sort(sortObj)
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .populate("projectId", "title status category")
        .lean(),
      CSRPledge.countDocuments(query),
    ]);

    return NextResponse.json({
      pledges,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    });
  } catch (error) {
    console.error("GET /api/csr-pledges error:", error);
    return NextResponse.json({ error: "Failed to fetch pledges" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const validated = csrPledgeSchema.parse(body);

    const project = await CSRProject.findById(validated.projectId).lean();
    if (!project) {
      return NextResponse.json({ error: "CSR project not found" }, { status: 404 });
    }
    if (project.status !== "Open") {
      return NextResponse.json({ error: "This project is not open for pledges" }, { status: 400 });
    }

    if (!Number.isFinite(validated.amount) || validated.amount <= 0) {
      return NextResponse.json({ error: "Invalid pledge amount" }, { status: 400 });
    }

    const pledge = await CSRPledge.create({
      ...validated,
      contactEmail: validated.contactEmail || undefined,
      contactPhone: validated.contactPhone || undefined,
      status: validated.status || "pledged",
      confirmationDate: validated.status === "confirmed" ? new Date() : undefined,
    });

    if (pledge.status === "confirmed") {
      await upsertCorporateSponsorContribution({
        companyName: validated.companyName,
        fiscalYear: validated.fiscalYear || "2025-26",
        amount: pledge.amount,
      });
    }

    await recomputeProjectRaisedAmount(String(pledge.projectId));

    // Fire-and-forget admin notification (don't block pledge creation)
    sendCSRPledgeAdminNotification({
      companyName: pledge.companyName,
      contactEmail: pledge.contactEmail ?? undefined,
      contactPhone: pledge.contactPhone ?? undefined,
      amount: pledge.amount,
      projectTitle: (project as any).title || "Unknown",
      fiscalYear: pledge.fiscalYear ?? undefined,
      notes: (pledge as any).notes ?? undefined,
    }).catch((err: unknown) => console.error("CSR pledge notification error:", err));

    return NextResponse.json({ pledge }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/csr-pledges error:", error);
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create pledge" }, { status: 500 });
  }
}
