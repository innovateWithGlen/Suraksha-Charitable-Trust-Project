import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Donation, Donor } from "@/lib/models";
import { donationSchema, paginationSchema } from "@/lib/validations";
import crypto from "crypto";

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

    return NextResponse.json({
      donations,
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

    // Upsert donor
    const donor = await Donor.findOneAndUpdate(
      { email: validated.donorEmail.toLowerCase() },
      {
        $set: {
          name: validated.donorName,
          phone: validated.donorPhone,
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
      donorPhone: validated.donorPhone,
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
