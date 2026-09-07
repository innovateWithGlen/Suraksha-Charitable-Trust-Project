import dbConnect from "@/lib/mongodb";
import { Setting } from "@/lib/models";

export type PaymentMode = "test" | "live";

export interface PaymentConfig {
  mode: PaymentMode;
  keyId: string;
  keySecret: string;
}

export class PaymentConfigError extends Error {
  status = 503;

  constructor(message: string) {
    super(message);
    this.name = "PaymentConfigError";
  }
}

// Resolves which Razorpay key pair to use based on the admin settings
// toggle (Setting key "paymentTestMode"):
//   - test mode  -> RAZORPAY_TEST_KEY_ID / RAZORPAY_TEST_KEY_SECRET
//   - live mode  -> RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET
export async function getPaymentConfig(): Promise<PaymentConfig> {
  await dbConnect();

  let mode: PaymentMode = "test";
  try {
    const setting = await Setting.findOne({ key: "paymentTestMode" })
      .select("value")
      .lean();
    if (setting && setting.value === "false") {
      mode = "live";
    }
  } catch (error) {
    console.error("Failed to read paymentTestMode setting:", error);
  }

  const keyId =
    mode === "test"
      ? process.env.RAZORPAY_TEST_KEY_ID
      : process.env.RAZORPAY_KEY_ID;
  const keySecret =
    mode === "test"
      ? process.env.RAZORPAY_TEST_KEY_SECRET
      : process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new PaymentConfigError(
      mode === "test"
        ? "Test payment gateway is not configured. Set RAZORPAY_TEST_KEY_ID / RAZORPAY_TEST_KEY_SECRET or switch off test mode in Admin → Settings."
        : "Live payment gateway is not configured. Set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET or enable test mode in Admin → Settings."
    );
  }

  return { mode, keyId, keySecret };
}