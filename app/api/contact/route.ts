import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { ContactInquiry } from "@/lib/models";
import { contactSchema } from "@/lib/validations";
import { sendContactNotification } from "@/lib/email";
import { auth } from "@/lib/auth";

// GET /api/contact - List inquiries (admin only)
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

    const inquiries = await ContactInquiry.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const counts = await ContactInquiry.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    return NextResponse.json({
      inquiries,
      counts: counts.reduce(
        (acc: Record<string, number>, c: { _id: string; count: number }) => {
          acc[c._id] = c.count;
          return acc;
        },
        {}
      ),
    });
  } catch (error) {
    console.error("GET /api/contact error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}

// POST /api/contact - Submit contact form (public)
export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const validated = contactSchema.parse(body);

    const inquiry = await ContactInquiry.create(validated);

    // Send email notification to admin (non-blocking)
    sendContactNotification(validated).catch((err) =>
      console.error("Failed to send contact notification email:", err)
    );

    return NextResponse.json(
      { message: "Inquiry submitted successfully", id: inquiry._id },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/contact error:", error);
    if ((error as { name?: string }).name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: (error as { errors?: unknown }).errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}
