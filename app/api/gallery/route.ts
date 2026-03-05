import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { GalleryEvent } from "@/lib/models";
import { galleryEventSchema } from "@/lib/validations";

// GET /api/gallery - List gallery events (public)
export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const activeOnly = searchParams.get("active") !== "false";

    const query: Record<string, unknown> = {};
    if (category && category !== "all") query.category = category;
    if (activeOnly) query.isActive = true;

    const events = await GalleryEvent.find(query)
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({ events });
  } catch (error) {
    console.error("GET /api/gallery error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery events" },
      { status: 500 }
    );
  }
}

// POST /api/gallery - Create gallery event
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const validated = galleryEventSchema.parse(body);

    const event = await GalleryEvent.create({
      ...validated,
      updatedBy: (session.user as any).id,
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/gallery error:", error);
    if ((error as { name?: string }).name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: (error as { errors?: unknown }).errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create gallery event" },
      { status: 500 }
    );
  }
}
