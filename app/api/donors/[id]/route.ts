import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Donor } from "@/lib/models";
import { donorUpdateSchema } from "@/lib/validations";

// GET /api/donors/[id]
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
    const donor = await Donor.findById(id).lean();

    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    }

    return NextResponse.json({ donor });
  } catch (error) {
    console.error("GET /api/donors/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch donor" },
      { status: 500 }
    );
  }
}

// PUT /api/donors/[id]
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
    const validated = donorUpdateSchema.parse(body);

    const donor = await Donor.findByIdAndUpdate(
      id,
      { $set: validated },
      { new: true, runValidators: true }
    );

    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    }

    return NextResponse.json({ donor });
  } catch (error) {
    console.error("PUT /api/donors/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update donor" },
      { status: 500 }
    );
  }
}

// DELETE /api/donors/[id]
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
    const donor = await Donor.findByIdAndDelete(id);

    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Donor deleted" });
  } catch (error) {
    console.error("DELETE /api/donors/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete donor" },
      { status: 500 }
    );
  }
}
