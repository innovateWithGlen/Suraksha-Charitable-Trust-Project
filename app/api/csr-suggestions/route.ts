import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { CSRProjectSuggestion } from "@/lib/models";
import { csrSuggestionSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

// GET /api/csr-suggestions - List suggestions (admin only)
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const suggestions = await CSRProjectSuggestion.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const counts = await CSRProjectSuggestion.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    return NextResponse.json({
      suggestions,
      counts: counts.reduce(
        (acc: Record<string, number>, c: { _id: string; count: number }) => {
          acc[c._id] = c.count;
          return acc;
        },
        {}
      ),
    });
  } catch (error) {
    console.error("GET /api/csr-suggestions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}

// POST /api/csr-suggestions - Submit a project suggestion (public)
export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const validated = csrSuggestionSchema.parse(body);

    const suggestion = await CSRProjectSuggestion.create(validated);

    return NextResponse.json(
      {
        message: "Project suggestion submitted successfully. We will review it and get back to you.",
        id: suggestion._id,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/csr-suggestions error:", error);
    if ((error as { name?: string }).name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: (error as { errors?: unknown }).errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to submit suggestion" },
      { status: 500 }
    );
  }
}

// PUT /api/csr-suggestions - Update suggestion status (admin only)
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { id, status, adminNotes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID and status are required" },
        { status: 400 }
      );
    }

    const suggestion = await CSRProjectSuggestion.findByIdAndUpdate(
      id,
      { status, adminNotes },
      { new: true }
    );

    if (!suggestion) {
      return NextResponse.json(
        { error: "Suggestion not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("PUT /api/csr-suggestions error:", error);
    return NextResponse.json(
      { error: "Failed to update suggestion" },
      { status: 500 }
    );
  }
}
