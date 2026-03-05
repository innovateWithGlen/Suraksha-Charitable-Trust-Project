import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { GalleryEvent } from "@/lib/models";
import { galleryEventUpdateSchema } from "@/lib/validations";

// PUT /api/gallery/[id]
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
    const validated = galleryEventUpdateSchema.parse(body);

    const event = await GalleryEvent.findByIdAndUpdate(
      id,
      { $set: { ...validated, updatedBy: (session.user as any).id } },
      { new: true, runValidators: true }
    );

    if (!event) {
      return NextResponse.json(
        { error: "Gallery event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("PUT /api/gallery/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update gallery event" },
      { status: 500 }
    );
  }
}

// DELETE /api/gallery/[id]
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
    const event = await GalleryEvent.findByIdAndDelete(id);

    if (!event) {
      return NextResponse.json(
        { error: "Gallery event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Gallery event deleted" });
  } catch (error) {
    console.error("DELETE /api/gallery/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete gallery event" },
      { status: 500 }
    );
  }
}
