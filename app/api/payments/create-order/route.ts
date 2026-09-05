import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import dbConnect from "@/lib/mongodb";
import { Donation } from "@/lib/models";

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
const isDemoMode =
  !razorpayKeyId ||
  !razorpayKeySecret ||
  process.env.DEMO_PAYMENTS === "true";

// POST /api/payments/create-order - Create Razorpay order for an existing donation
export async function POST(request: Request) {
  try {
    const { donationId, amount } = await request.json();

    if (!donationId) {
      return NextResponse.json(
        { error: "Donation ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // The donation record is the source of truth for the amount.
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
    if (amount !== undefined && amount !== null && Math.round(Number(amount)) !== payAmount) {
      return NextResponse.json(
        { error: "Amount does not match the donation record" },
        { status: 400 }
      );
    }

    if (isDemoMode) {
      const demoOrderId = `demo_order_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
      await Donation.findByIdAndUpdate(donationId, {
        razorpayOrderId: demoOrderId,
      });

      return NextResponse.json({
        orderId: demoOrderId,
        amount: payAmount * 100,
        currency: "INR",
        key: null,
        demoMode: true,
      });
    }

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { error: "Payment gateway is not configured" },
        { status: 503 }
      );
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
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
      key: razorpayKeyId,
      demoMode: false,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}