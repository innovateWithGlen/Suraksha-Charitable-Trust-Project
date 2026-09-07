import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import dbConnect from "@/lib/mongodb";
import { Donation, Donor } from "@/lib/models";
import { sendDonationConfirmation } from "@/lib/email";
import { generateReceiptForDonation } from "@/lib/services/certificate-service";
import { getPaymentConfig, PaymentConfigError } from "@/lib/payment-config";

// POST /api/payments/verify - Verify Razorpay payment and complete the donation.
export async function POST(request: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donationId,
    } = await request.json();

    if (!donationId || !razorpay_order_id) {
      return NextResponse.json(
        { error: "Donation ID and order ID are required" },
        { status: 400 }
      );
    }

    const config = await getPaymentConfig();

    await dbConnect();

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    // Binding: the Razorpay order must have been created for this donation.
    if (!donation.razorpayOrderId || donation.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json(
        { error: "Payment order does not match this donation" },
        { status: 400 }
      );
    }

    // Already fully processed -> idempotent success, no side effects repeated.
    if (
      donation.status === "completed" ||
      donation.status === "success"
    ) {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        donation,
        receipt: donation.certificateUrl
          ? { id: String(donation._id), url: donation.certificateUrl }
          : null,
      });
    }

    const razorpay = new Razorpay({
      key_id: config.keyId,
      key_secret: config.keySecret,
    });

    let paymentMethod = "upi";

    try {
      // Signature must be present and valid.
      if (!razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json(
          { error: "Payment ID and signature are required" },
          { status: 400 }
        );
      }

      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac("sha256", config.keySecret)
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return NextResponse.json(
          { error: "Invalid payment signature" },
          { status: 400 }
        );
      }

      // Server-side truth: order must be settled as paid with the right amount,
      // and the payment must belong to this order.
      const [paidOrder, payment] = await Promise.all([
        razorpay.orders.fetch(razorpay_order_id),
        razorpay.payments.fetch(razorpay_payment_id),
      ]);
      if (paidOrder?.amount !== donation.amount * 100) {
        return NextResponse.json(
          { error: "Payment amount does not match the donation" },
          { status: 400 }
        );
      }
      if (paidOrder?.status !== "paid") {
        return NextResponse.json(
          { error: "Payment has not been completed" },
          { status: 400 }
        );
      }
      if (payment?.order_id !== razorpay_order_id) {
        return NextResponse.json(
          { error: "Payment does not match this order" },
          { status: 400 }
        );
      }
      paymentMethod = typeof payment?.method === "string" ? payment.method : "upi";
    } catch (orderError) {
      console.error("Failed to verify Razorpay payment:", orderError);
      return NextResponse.json(
        { error: "Could not confirm payment status" },
        { status: 400 }
      );
    }

    // Atomic claim: only transition from pending/failed, so a payment is
    // processed exactly once (no double email / stats / 80G aggregation).
    const claimed = await Donation.findOneAndUpdate(
      { _id: donation._id, status: { $in: ["pending", "failed"] } },
      {
        $set: {
          status: "completed",
          transactionId: razorpay_payment_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          method: paymentMethod,
        },
      },
      { returnDocument: "after" }
    );

    if (!claimed) {
      const current = await Donation.findById(donationId);
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        donation: current,
      });
    }

    // Update donor stats
    await Donor.findByIdAndUpdate(claimed.donorId, {
      $inc: { totalDonated: claimed.amount, donationCount: 1 },
      $set: { lastDonationDate: new Date(), status: "active" },
    });

    let receipt: {
      id: string;
      number: string;
      url: string;
      sent: boolean;
    } | null = null;

    if (claimed.requires80G) {
      try {
        const generated = await generateReceiptForDonation(String(claimed._id), {
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
      { name: claimed.donorName, email: claimed.donorEmail },
      {
        transactionId: claimed.transactionId,
        amount: claimed.amount,
        method: claimed.method,
        createdAt: claimed.createdAt,
        requires80G: claimed.requires80G,
      }
    ).catch((err) =>
      console.error("Failed to send donation confirmation email:", err)
    );

    return NextResponse.json({
      success: true,
      donation: claimed,
      receipt,
    });
  } catch (error) {
    if (error instanceof PaymentConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}