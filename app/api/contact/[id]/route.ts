import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { ContactInquiry } from "@/lib/models";
import { inquiryUpdateSchema } from "@/lib/validations";
import { sendInquiryReplyEmail } from "@/lib/email";

// PUT /api/contact/[id] - Update inquiry status
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
    const body = inquiryUpdateSchema.parse(await request.json());

    const updateData: Record<string, unknown> = {};
    if (body.status) {
      updateData.status = body.status;
      if (body.status === "replied") {
        updateData.repliedAt = new Date();
      }
    }

    if (body.replyContent) {
      updateData.replyContent = body.replyContent;
      updateData.replyTimestamp = new Date();
      updateData.status = "replied";
      updateData.repliedAt = new Date();
      updateData.replyEmailSent = false;
    }

    const inquiry = await ContactInquiry.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!inquiry) {
      return NextResponse.json(
        { error: "Inquiry not found" },
        { status: 404 }
      );
    }

    if (body.replyContent && body.sendEmail) {
      try {
        await sendInquiryReplyEmail({
          toEmail: inquiry.email,
          toName: inquiry.name,
          subject: inquiry.subject,
          replyContent: body.replyContent,
        });

        await ContactInquiry.updateOne(
          { _id: inquiry._id },
          { $set: { replyEmailSent: true } }
        );
      } catch (emailError) {
        console.error("Failed to send inquiry reply email:", emailError);
      }
    }

    return NextResponse.json({ inquiry });
  } catch (error: unknown) {
    console.error("PUT /api/contact/[id] error:", error);
    if ((error as { name?: string }).name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: (error as { errors?: unknown }).errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 500 }
    );
  }
}

// DELETE /api/contact/[id]
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
    const inquiry = await ContactInquiry.findByIdAndDelete(id);

    if (!inquiry) {
      return NextResponse.json(
        { error: "Inquiry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Inquiry deleted" });
  } catch (error) {
    console.error("DELETE /api/contact/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete inquiry" },
      { status: 500 }
    );
  }
}
