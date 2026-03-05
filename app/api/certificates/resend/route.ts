import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { certificateResendSchema } from "@/lib/validations";
import { resendReceiptEmail } from "@/lib/services/certificate-service";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = certificateResendSchema.parse(await request.json());
    const result = await resendReceiptEmail(payload.certificateId);

    return NextResponse.json({ success: true, receipt: result });
  } catch (error: unknown) {
    console.error("POST /api/certificates/resend error:", error);
    if ((error as { name?: string }).name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: (error as { errors?: unknown }).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: (error as Error).message || "Failed to resend receipt" },
      { status: 500 }
    );
  }
}
