import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { CorporateSponsor } from "@/lib/models";
import { corporateSponsorSchema } from "@/lib/validations";

export async function GET() {
  try {
    await dbConnect();
    const sponsors = await CorporateSponsor.find({ isActive: true })
      .sort({ totalContributed: -1, companyName: 1 })
      .lean();

    return NextResponse.json({ sponsors });
  } catch (error) {
    console.error("GET /api/corporate-sponsors error:", error);
    return NextResponse.json({ error: "Failed to fetch sponsors" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const validated = corporateSponsorSchema.parse(body);

    const sponsor = await CorporateSponsor.findOneAndUpdate(
      { companyName: validated.companyName.trim(), fiscalYear: validated.fiscalYear },
      {
        $set: {
          logoUrl: validated.logoUrl || undefined,
          totalContributed: validated.totalContributed,
          isActive: validated.isActive,
        },
      },
      { upsert: true, new: true, runValidators: true }
    ).lean();

    return NextResponse.json({ sponsor }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/corporate-sponsors error:", error);
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save sponsor" }, { status: 500 });
  }
}
