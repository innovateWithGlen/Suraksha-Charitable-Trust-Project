import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import dbConnect from "@/lib/mongodb";
import { Donation } from "@/lib/models";

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
const isDemoMode = !razorpayKeyId || !razorpayKeySecret;

// POST /api/payments/create-order - Create Razorpay order
export async function POST(request: Request) {
  try {
    const { donationId, amount } = await request.json();

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: "Minimum donation amount is ₹100" },
        { status: 400 }
      );
    }

    await dbConnect();

    if (isDemoMode) {
      const demoOrderId = `demo_order_${Date.now()}`;

      if (donationId) {
        await Donation.findByIdAndUpdate(donationId, {
          razorpayOrderId: demoOrderId,
        });
      }

      return NextResponse.json({
        orderId: demoOrderId,
        amount: amount * 100,
        currency: "INR",
        key: null,
        demoMode: true,
      });
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    // Create Razorpay order (amount in paise)
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: donationId || `receipt_${Date.now()}`,
      notes: {
        donationId: donationId || "",
      },
    });

    // Update donation with razorpay order ID
    if (donationId) {
      await Donation.findByIdAndUpdate(donationId, {
        razorpayOrderId: order.id,
      });
    }

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
