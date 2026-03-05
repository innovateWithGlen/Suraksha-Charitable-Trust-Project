import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { CSRProject } from "@/lib/models";
import { csrProjectSchema, paginationSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;

    const params = paginationSchema.parse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
      search: searchParams.get("search") || undefined,
      status,
      sort: searchParams.get("sort") || "createdAt",
      order: searchParams.get("order") || "desc",
    });

    const query: Record<string, unknown> = {};
    if (params.search) {
      query.$text = { $search: params.search };
    }
    if (status) {
      query.status = status;
    }
    if (category) {
      query.category = category;
    }

    const sortObj: Record<string, 1 | -1> = {
      [params.sort || "createdAt"]: params.order === "asc" ? 1 : -1,
    };

    const [projects, total] = await Promise.all([
      CSRProject.find(query)
        .sort(sortObj)
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .populate("sponsoringCompanies", "companyName logoUrl totalContributed")
        .lean(),
      CSRProject.countDocuments(query),
    ]);

    return NextResponse.json({
      projects,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    });
  } catch (error) {
    console.error("GET /api/csr-projects error:", error);
    return NextResponse.json({ error: "Failed to fetch CSR projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const validated = csrProjectSchema.parse(body);

    const project = await CSRProject.create({
      ...validated,
      coverImageUrl: validated.coverImageUrl || undefined,
      createdBy: (session.user as any)?.id,
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/csr-projects error:", error);
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create CSR project" }, { status: 500 });
  }
}
