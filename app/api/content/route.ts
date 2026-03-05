import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Content } from "@/lib/models";
import { contentSchema, contentUpdateSchema } from "@/lib/validations";

// GET /api/content - List content, optionally by type
export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const activeOnly = searchParams.get("active") === "true";

    const query: Record<string, unknown> = {};
    if (type) query.type = type;
    if (activeOnly) query.isActive = true;

    const content = await Content.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ content });
  } catch (error) {
    console.error("GET /api/content error:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

// POST /api/content - Create content item
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const validated = contentSchema.parse(body);

    const content = await Content.create({
      ...validated,
      updatedBy: (session.user as any).id,
    });

    return NextResponse.json({ content }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/content error:", error);
    if ((error as { name?: string }).name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: (error as { errors?: unknown }).errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create content" },
      { status: 500 }
    );
  }
}
