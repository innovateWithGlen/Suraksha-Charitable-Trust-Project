import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import OTP from "@/lib/models/OTP";
import User from "@/lib/models/User";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user exists and is an admin
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "No admin account found with this email" },
        { status: 404 }
      );
    }

    // Rate limit: max 3 OTPs per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOTPs = await OTP.countDocuments({
      email: email.toLowerCase(),
      createdAt: { $gt: oneHourAgo },
    });

    if (recentOTPs >= 3) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please try again later." },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Save hashed OTP with 5-minute expiry
    await OTP.create({
      email: email.toLowerCase(),
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Send OTP via email
    await resend.emails.send({
      from: "Suraksha Trust <noreply@glenmonteiro47@gmail.com>",
      to: email,
      subject: "Your Login OTP - Suraksha Charitable Trust",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a365d; margin: 0;">Suraksha Charitable Trust</h1>
            <p style="color: #64748b; margin-top: 5px;">Admin Portal</p>
          </div>
          <div style="background: #f8fafc; border-radius: 12px; padding: 30px; text-align: center;">
            <p style="color: #334155; margin-bottom: 20px;">Your one-time login code is:</p>
            <div style="background: #1a365d; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 16px 24px; border-radius: 8px; display: inline-block;">
              ${otp}
            </div>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 20px;">
              This code expires in 5 minutes. Do not share it with anyone.
            </p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
