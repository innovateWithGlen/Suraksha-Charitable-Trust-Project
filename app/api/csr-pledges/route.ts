import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { CSRPledge, CSRProject, CorporateSponsor } from "@/lib/models";
import { csrPledgeSchema, paginationSchema } from "@/lib/validations";

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

    const pledge = await CSRPledge.create({
      ...validated,
      contactEmail: validated.contactEmail || undefined,
      status: validated.status || "pledged",
    });

    if (pledge.status === "confirmed") {
      await CorporateSponsor.findOneAndUpdate(
        { companyName: validated.companyName.trim(), fiscalYear: validated.fiscalYear || "2025-26" },
        {
          $inc: { totalContributed: pledge.amount },
          $setOnInsert: {
            isActive: true,
            logoUrl: "",
            fiscalYear: validated.fiscalYear || "2025-26",
          },
        },
        { upsert: true, new: true }
      );
    }

    await recomputeProjectRaisedAmount(String(pledge.projectId));

    return NextResponse.json({ pledge }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/csr-pledges error:", error);
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create pledge" }, { status: 500 });
  }
}
