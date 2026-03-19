import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import { Donation, Donor } from "@/lib/models";
import { sendDonationConfirmation } from "@/lib/email";
import { generateReceiptForDonation } from "@/lib/services/certificate-service";

// POST /api/payments/verify - Verify Razorpay payment
export async function POST(request: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donationId,
    } = await request.json();

    if (!donationId) {
      return NextResponse.json({ error: "Donation ID is required" }, { status: 400 });
    }

    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    const isDemoMode = !razorpaySecret;

    if (razorpaySecret) {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac("sha256", razorpaySecret)
        .update(body)
        .digest("hex");

      const isValid = expectedSignature === razorpay_signature;

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid payment signature" },
          { status: 400 }
        );
      }
    }

    await dbConnect();

    const resolvedTxnId = razorpay_payment_id || `demo_pay_${Date.now()}`;

    if (isDemoMode) {
      const settledCount = await Donation.countDocuments({
        status: { $in: ["completed", "success", "failed"] },
      });
      const shouldFailThisAttempt = (settledCount + 1) % 5 === 0;

      if (shouldFailThisAttempt) {
        await Donation.findByIdAndUpdate(donationId, {
          $set: {
            status: "failed",
            transactionId: resolvedTxnId,
            razorpayPaymentId: razorpay_payment_id || undefined,
            razorpaySignature: razorpay_signature || undefined,
            method: "other",
            notes: "Demo rule: every 5th transaction fails",
          },
        });

        return NextResponse.json(
          { error: "Demo failure: every 5th transaction is marked as failed" },
          { status: 402 }
        );
      }
    }

    // Update donation status
    const donation = await Donation.findByIdAndUpdate(
      donationId,
      {
        $set: {
          status: "completed",
          transactionId: resolvedTxnId,
          razorpayPaymentId: razorpay_payment_id || undefined,
          razorpaySignature: razorpay_signature || undefined,
          method: razorpay_payment_id ? "upi" : "other",
        },
      },
      { new: true }
    );

    if (!donation) {
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );
    }

    // Update donor stats
    await Donor.findByIdAndUpdate(donation.donorId, {
      $inc: { totalDonated: donation.amount, donationCount: 1 },
      $set: { lastDonationDate: new Date(), status: "active" },
    });

    let receipt: {
      id: string;
      number: string;
      url: string;
      sent: boolean;
    } | null = null;

    if (donation.requires80G) {
      try {
        const generated = await generateReceiptForDonation(String(donation._id), {
          resendEmail: true,
          forceRegenerate: false,
        });
        receipt = {
          id: generated.certificateId,
          number: generated.certificateNumber,
          url: generated.pdfUrl,
          sent: generated.receiptSent,
        };
      } catch (receiptError) {
        console.error("Failed to auto-generate 80G receipt:", receiptError);
      }
    }

    // Send confirmation email (non-blocking)
    sendDonationConfirmation(
      { name: donation.donorName, email: donation.donorEmail },
      {
        transactionId: donation.transactionId,
        amount: donation.amount,
        method: donation.method,
        createdAt: donation.createdAt,
      }
    ).catch((err) =>
      console.error("Failed to send donation confirmation email:", err)
    );

    return NextResponse.json({
      success: true,
      donation,
      receipt,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
