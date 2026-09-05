import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Donor } from "@/lib/models";
import { donorSchema, paginationSchema } from "@/lib/validations";
import { encrypt } from "@/lib/encryption";
import { isValidIdProofNumber, isValidPanNumber, normalizeIdProofNumber, normalizePanNumber } from "@/lib/identity-format";

// GET /api/donors - List donors with search/filter/pagination
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

    if (params.search) {
      query.$or = [
        { name: { $regex: params.search, $options: "i" } },
        { email: { $regex: params.search, $options: "i" } },
        { phone: { $regex: params.search, $options: "i" } },
      ];
    }

    if (params.status) {
      query.status = params.status;
    }

    const sortObj: Record<string, 1 | -1> = {
      [params.sort || "createdAt"]: params.order === "asc" ? 1 : -1,
    };

    const [donors, total] = await Promise.all([
      Donor.find(query)
        .sort(sortObj)
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .lean(),
      Donor.countDocuments(query),
    ]);

    return NextResponse.json({
      donors,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    });
  } catch (error) {
    console.error("GET /api/donors error:", error);
    return NextResponse.json(
      { error: "Failed to fetch donors" },
      { status: 500 }
    );
  }
}

// POST /api/donors - Create a donor (admin only; PII is encrypted at rest)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const validated = donorSchema.parse(body);

    const panNumber = normalizePanNumber(validated.panNumber) || "";
    const idProofType = validated.idProofType || undefined;
    const idProofNumber =
      idProofType === "aadhaar"
        ? normalizeIdProofNumber("aadhaar", validated.idProofNumber) || ""
        : idProofType
          ? normalizeIdProofNumber(idProofType, validated.idProofNumber) || ""
          : "";

    if (panNumber && !isValidPanNumber(panNumber)) {
      return NextResponse.json({ error: "Invalid PAN number format" }, { status: 400 });
    }

    if (idProofType && idProofNumber && !isValidIdProofNumber(idProofType, idProofNumber)) {
      return NextResponse.json({ error: "Invalid alternate ID format" }, { status: 400 });
    }

    // Encrypt PAN number if provided
    const encryptedPanNumber = panNumber ? encrypt(panNumber) : undefined;
    const encryptedIdProofNumber =
      idProofType && idProofNumber ? encrypt(idProofNumber) : undefined;

    // Upsert: update if exists (by email), create if new
    const donor = await Donor.findOneAndUpdate(
      { email: validated.email.toLowerCase() },
      {
        $set: {
          name: validated.name,
          phone: validated.phone,
          ...(encryptedPanNumber && { panNumber: encryptedPanNumber }),
          ...(idProofType && encryptedIdProofNumber && {
            idProofType,
            idProofNumber: encryptedIdProofNumber,
          }),
          ...(validated.address && { address: validated.address }),
          ...(validated.city && { city: validated.city }),
          ...(validated.state && { state: validated.state }),
          ...(validated.pincode && { pincode: validated.pincode }),
        },
        $setOnInsert: {
          totalDonated: 0,
          donationCount: 0,
          status: "active",
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({ donor }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/donors error:", error);
    if ((error as { name?: string }).name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: (error as { errors?: unknown }).errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create donor" },
      { status: 500 }
    );
  }
}
