import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { ContactInquiry, Donation } from "@/lib/models";
import { notificationClearAllSchema, notificationUpdateSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const [donations, inquiries] = await Promise.all([
      Donation.find({
        status: { $in: ["pending", "failed"] },
        notificationRead: { $ne: true },
      })
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      ContactInquiry.find({ status: "new" })
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
    ]);

    const donationNotifications = donations.map((donation) => ({
      id: String(donation._id),
      type: "donation" as const,
      title: `Donation ${donation.status}`,
      description: `${donation.donorName} donated INR ${donation.amount.toLocaleString("en-IN")}`,
      createdAt: donation.createdAt,
      targetUrl: "/admin/donations",
    }));

    const inquiryNotifications = inquiries.map((inquiry) => ({
      id: String(inquiry._id),
      type: "inquiry" as const,
      title: `New inquiry from ${inquiry.name}`,
      description: inquiry.subject,
      createdAt: inquiry.createdAt,
      targetUrl: "/admin/inquiries",
    }));

    const notifications = [...donationNotifications, ...inquiryNotifications]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 12);

    return NextResponse.json({
      unreadCount: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const clearAllAttempt = notificationClearAllSchema.safeParse(body);

    if (clearAllAttempt.success) {
      await Promise.all([
        ContactInquiry.updateMany(
          { status: "new" },
          { $set: { status: "read" } }
        ),
        Donation.updateMany(
          {
            status: { $in: ["pending", "failed"] },
            notificationRead: { $ne: true },
          },
          { $set: { notificationRead: true, notificationReadAt: new Date() } }
        ),
      ]);

      return NextResponse.json({ success: true, cleared: true });
    }

    const payload = notificationUpdateSchema.parse(body);

    if (payload.type === "inquiry") {
      await ContactInquiry.updateOne(
        { _id: payload.id, status: "new" },
        { $set: { status: "read" } }
      );
    }

    if (payload.type === "donation") {
      await Donation.updateOne(
        { _id: payload.id },
        { $set: { notificationRead: true, notificationReadAt: new Date() } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("PATCH /api/notifications error:", error);
    if ((error as { name?: string }).name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: (error as { errors?: unknown }).errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
