import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Donation, Donor } from "@/lib/models";
import { donationSchema, paginationSchema } from "@/lib/validations";
import { encrypt } from "@/lib/encryption";
import { isValidIdProofNumber, isValidPanNumber, normalizeIdProofNumber, normalizePanNumber } from "@/lib/identity-format";
import crypto from "crypto";

function normalizeIndianPhone(value?: string) {
  const source = String(value || "");
  const digitsOnly = source.replace(/\D/g, "");
  const withoutCountryCode = digitsOnly.startsWith("91")
    ? digitsOnly.slice(2)
    : digitsOnly;
  const localTenDigits = withoutCountryCode.slice(0, 10);

  return localTenDigits ? `+91${localTenDigits}` : "";
}

// GET /api/donations - List donations with filters
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
        { donorName: { $regex: params.search, $options: "i" } },
        { donorEmail: { $regex: params.search, $options: "i" } },
        { transactionId: { $regex: params.search, $options: "i" } },
      ];
    }

    if (params.status) {
      query.status = params.status;
    }

    const requires80G = searchParams.get("requires80G");
    if (requires80G === "true") {
      query.requires80G = true;
    } else if (requires80G === "false") {
      query.requires80G = false;
    }

    // Date range filter
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (from || to) {
      query.createdAt = {};
      if (from) (query.createdAt as Record<string, unknown>).$gte = new Date(from);
      if (to) (query.createdAt as Record<string, unknown>).$lte = new Date(to);
    }

    const sortObj: Record<string, 1 | -1> = {
      [params.sort || "createdAt"]: params.order === "asc" ? 1 : -1,
    };

    const [donations, total] = await Promise.all([
      Donation.find(query)
        .sort(sortObj)
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .lean(),
      Donation.countDocuments(query),
    ]);

    const donorIds = Array.from(
      new Set(
        donations
          .map((donation) => String(donation.donorId || ""))
          .filter(Boolean)
      )
    );

    const donors = donorIds.length
      ? await Donor.find({ _id: { $in: donorIds } })
          .select("_id panNumber idProofType idProofNumber")
          .lean()
      : [];

    const donorMap = new Map(donors.map((donor) => [String(donor._id), donor]));

    const enrichedDonations = donations.map((donation) => {
      const donor = donorMap.get(String(donation.donorId));
      const hasPan = !!donor?.panNumber;
      const hasAlternateId = !!donor?.idProofType && !!donor?.idProofNumber;

      return {
        ...donation,
        hasPan,
        hasAlternateId,
        idProofType: donor?.idProofType || null,
        is80GIdentityReady: !donation.requires80G || hasPan || hasAlternateId,
      };
    });

    return NextResponse.json({
      donations: enrichedDonations,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    });
  } catch (error) {
    console.error("GET /api/donations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}

// POST /api/donations - Create a donation (public, called from donate page)
export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const validated = donationSchema.parse(body);

    const panNumber = normalizePanNumber(validated.panNumber) || "";
    const donorPhone = normalizeIndianPhone(validated.donorPhone);
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

    if (donorPhone && !/^\+91\d{10}$/.test(donorPhone)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    // Upsert donor
    const donor = await Donor.findOneAndUpdate(
      { email: validated.donorEmail.toLowerCase() },
      {
        $set: {
          name: validated.donorName,
          phone: donorPhone,
          ...(panNumber && { panNumber: encrypt(panNumber) }),
          ...(idProofType && idProofNumber && {
            idProofType,
            idProofNumber: encrypt(idProofNumber),
          }),
        },
        $setOnInsert: {
          totalDonated: 0,
          donationCount: 0,
          status: "active",
        },
      },
      { upsert: true, new: true }
    );

    // Generate transaction ID
    const transactionId = `SCT-${Date.now()}-${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;

    // Create donation record
    const donationNotes = [
      validated.notes,
      validated.requires80G ? "80G certificate requested" : undefined,
    ]
      .filter(Boolean)
      .join(" | ");

    const donation = await Donation.create({
      donorId: donor._id,
      donorName: validated.donorName,
      donorEmail: validated.donorEmail.toLowerCase(),
      donorPhone: donorPhone,
      amount: validated.amount,
      method: validated.method,
      requires80G: validated.requires80G || false,
      status: "pending",
      transactionId,
      notes: donationNotes || undefined,
    });

    return NextResponse.json(
      {
        donation,
        transactionId,
        donorId: donor._id,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/donations error:", error);
    if ((error as { name?: string }).name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: (error as { errors?: unknown }).errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create donation" },
      { status: 500 }
    );
  }
}
