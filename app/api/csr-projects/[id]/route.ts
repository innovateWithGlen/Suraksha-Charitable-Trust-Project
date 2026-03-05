import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { CSRProject } from "@/lib/models";
import { csrProjectUpdateSchema } from "@/lib/validations";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const project = await CSRProject.findById(id)
      .populate("sponsoringCompanies", "companyName logoUrl totalContributed")
      .lean();

    if (!project) {
      return NextResponse.json({ error: "CSR project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("GET /api/csr-projects/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch CSR project" }, { status: 500 });
  }
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
    const validated = csrProjectUpdateSchema.parse(body);

    const project = await CSRProject.findByIdAndUpdate(
      id,
      {
        $set: {
          ...validated,
          ...(validated.coverImageUrl === "" && { coverImageUrl: undefined }),
        },
      },
      { new: true, runValidators: true }
    ).lean();

    if (!project) {
      return NextResponse.json({ error: "CSR project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error("PUT /api/csr-projects/[id] error:", error);
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update CSR project" }, { status: 500 });
  }
}

export async function DELETE(
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

    const project = await CSRProject.findByIdAndUpdate(
      id,
      { $set: { status: "Closed" } },
      { new: true }
    ).lean();

    if (!project) {
      return NextResponse.json({ error: "CSR project not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "CSR project closed", project });
  } catch (error) {
    console.error("DELETE /api/csr-projects/[id] error:", error);
    return NextResponse.json({ error: "Failed to close CSR project" }, { status: 500 });
  }
}
