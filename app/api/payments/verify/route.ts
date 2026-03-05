import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import { Donation, Donor, Certificate } from "@/lib/models";
import { sendDonationConfirmation } from "@/lib/email";
import {
  generateCertificateHTML,
  generateCertificateNumber,
} from "@/lib/certificate-generator";

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

    // Generate 80G certificate
    const certificateNumber = generateCertificateNumber();
    const certificateHTML = generateCertificateHTML({
      certificateNumber,
      donorName: donation.donorName,
      amount: donation.amount,
      donationDate: donation.createdAt,
      transactionId: donation.transactionId,
      trustName: "Suraksha Charitable Trust",
      trustRegistrationNumber: "80G/2024/XXXXX",
      trustAddress: "Mumbai, Maharashtra, India",
      trustPan: "AAATS1234A",
    });

    // Save certificate record
    const certificate = await Certificate.create({
      donationId: donation._id,
      donorId: donation.donorId,
      certificateNumber,
      pdfUrl: "", // Will be updated when PDF is generated
      type: "auto",
      donorName: donation.donorName,
      amount: donation.amount,
      donationDate: donation.createdAt,
    });

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
      certificate: {
        id: certificate._id,
        number: certificateNumber,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
