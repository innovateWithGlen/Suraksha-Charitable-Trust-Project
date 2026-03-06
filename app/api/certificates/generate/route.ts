import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { certificateGenerateSchema } from "@/lib/validations";
import { generateReceiptForDonation } from "@/lib/services/certificate-service";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = certificateGenerateSchema.parse(await request.json());
    const result = await generateReceiptForDonation(payload.donationId, {
      resendEmail: payload.resendEmail,
      forceRegenerate: true,
    });

    return NextResponse.json({
      success: true,
      receipt: result,
      warning: result.emailError || undefined,
    });
  } catch (error: unknown) {
    console.error("POST /api/certificates/generate error:", error);
    if ((error as { name?: string }).name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: (error as { errors?: unknown }).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: (error as Error).message || "Failed to generate receipt" },
      { status: 500 }
    );
  }
}
