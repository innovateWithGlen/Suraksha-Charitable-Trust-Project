import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import dbConnect from "@/lib/mongodb";
import { Donation } from "@/lib/models";
import { getPaymentConfig, PaymentConfigError } from "@/lib/payment-config";

// POST /api/payments/create-order - Create a Razorpay order for an existing donation.
// Uses the key pair selected by the Admin > Settings test-mode toggle.
export async function POST(request: Request) {
  try {
    const { donationId, amount } = await request.json();

    if (!donationId) {
      return NextResponse.json(
        { error: "Donation ID is required" },
        { status: 400 }
      );
    }

    const config = await getPaymentConfig();

    await dbConnect();

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );
    }

    if (
      donation.status === "completed" ||
      donation.status === "success"
    ) {
      return NextResponse.json(
        { error: "This donation has already been processed" },
        { status: 400 }
      );
    }

    const payAmount = donation.amount;
    if (!Number.isFinite(payAmount) || payAmount < 100) {
      return NextResponse.json(
        { error: "Invalid donation amount" },
        { status: 400 }
      );
    }

    // Reject a client-supplied amount that disagrees with the stored donation.
    if (
      amount !== undefined &&
      amount !== null &&
      Math.round(Number(amount)) !== payAmount
    ) {
      return NextResponse.json(
        { error: "Amount does not match the donation record" },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: config.keyId,
      key_secret: config.keySecret,
    });

    // Create Razorpay order (amount in paise) against the stored donation.
    const order = await razorpay.orders.create({
      amount: payAmount * 100,
      currency: "INR",
      receipt: String(donation._id),
      notes: {
        donationId: String(donation._id),
      },
    });

    await Donation.findByIdAndUpdate(donationId, {
      razorpayOrderId: order.id,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: config.keyId,
      mode: config.mode,
    });
  } catch (error) {
    if (error instanceof PaymentConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}