import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Donor } from "@/lib/models";
import { donorUpdateSchema } from "@/lib/validations";
import { encrypt } from "@/lib/encryption";
import { isValidIdProofNumber, isValidPanNumber, normalizeIdProofNumber, normalizePanNumber } from "@/lib/identity-format";

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

    const updatePayload: Record<string, unknown> = { ...validated };

    if (typeof validated.panNumber === "string") {
      const pan = normalizePanNumber(validated.panNumber) || "";
      if (pan && !isValidPanNumber(pan)) {
        return NextResponse.json({ error: "Invalid PAN number format" }, { status: 400 });
      }
      updatePayload.panNumber = pan ? encrypt(pan) : "";
    }

    if (typeof validated.idProofType === "string" || typeof validated.idProofNumber === "string") {
      const idProofType =
        typeof validated.idProofType === "string" && validated.idProofType.length > 0
          ? validated.idProofType
          : undefined;
      const idProofNumberRaw =
        typeof validated.idProofNumber === "string" ? validated.idProofNumber.trim() : "";

      if (idProofType && idProofNumberRaw) {
        const normalized =
          idProofType === "aadhaar"
            ? normalizeIdProofNumber("aadhaar", idProofNumberRaw)
            : normalizeIdProofNumber(idProofType as "passport" | "voterId", idProofNumberRaw);

        if (!normalized || !isValidIdProofNumber(idProofType as "aadhaar" | "passport" | "voterId", normalized)) {
          return NextResponse.json({ error: "Invalid alternate ID format" }, { status: 400 });
        }
        updatePayload.idProofType = idProofType;
        updatePayload.idProofNumber = encrypt(normalized);
      }
    }

    const donor = await Donor.findByIdAndUpdate(
      id,
      { $set: updatePayload },
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
