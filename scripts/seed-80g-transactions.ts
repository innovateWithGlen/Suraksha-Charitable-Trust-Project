import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

const TRANSACTION_IDS = [
  "RAND12L-202603-40-1772728327508",
  "RAND12L-202603-28-1772728327508",
  "MANUAL-80G-20260307-1-1772728050471",
  "MANUAL-80G-20260307-2-1772728050471",
  "demo_pay_1772797505380",
  "demo_pay_1772735931343",
  "demo_pay_1772735915962",
  "MCA-DEMO-001",
  "MCA-DEMO-002",
  "RAND12L-202602-12-1772728327508",
  "RAND12L-202602-3-1772728327508",
  "RAND12L-202602-35-1772728327508",
  "RAND12L-202512-21-1772728327508",
  "RAND12L-202510-36-1772728327508",
  "RAND12L-202505-7-1772728327508",
];

const SAMPLE_PAN = "SURAT0001A";
const SAMPLE_AADHAAR = "254178901234";

async function seedTransactionsWithIdentity() {
  const { default: dbConnect } = await import("@/lib/mongodb");
  const { Donor, Donation } = await import("@/lib/models");
  const { encrypt } = await import("@/lib/encryption");

  try {
    await dbConnect();
    console.log("✓ Connected to MongoDB\n");

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < TRANSACTION_IDS.length; i++) {
      const transactionId = TRANSACTION_IDS[i];
      const donorName = `80G Test Donor ${i + 1}`;
      const donorEmail = `80g-test-${i + 1}@suraksha.org`;

      try {
        // Create or update donor with 80G identity
        const encryptedPan = encrypt(SAMPLE_PAN);
        const encryptedAadhaar = encrypt(SAMPLE_AADHAAR);

        const donor = await Donor.findOneAndUpdate(
          { email: donorEmail.toLowerCase() },
          {
            $set: {
              name: donorName,
              email: donorEmail.toLowerCase(),
              phone: `9100000${String(i + 1).padStart(3, "0")}`,
              panNumber: encryptedPan,
              idProofType: "aadhaar",
              idProofNumber: encryptedAadhaar,
              status: "active",
            },
            $setOnInsert: {
              totalDonated: 0,
              donationCount: 0,
            },
          },
          { upsert: true, returnDocument: "after" }
        );

        // Create or update donation with 80G identity
        await Donation.findOneAndUpdate(
          { transactionId },
          {
            $set: {
              donorId: donor._id,
              donorName: donor.name,
              donorEmail: donor.email,
              donorPhone: donor.phone,
              amount: 5000 + i * 100,
              method: ["upi", "card", "netbanking", "wallet", "other"][i % 5],
              requires80G: true,
              status: "success",
              razorpayOrderId: `order_${transactionId}`.substring(0, 25),
              razorpayPaymentId: transactionId,
              razorpaySignature: "demo_signature",
              receiptGenerated: false,
              receiptSent: false,
              notificationRead: false,
              notes: "80G certificate requested",
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          { upsert: true, returnDocument: "after" }
        );

        console.log(
          `✓ Created/Updated: ${transactionId} (Donor: ${donorName}, PAN: ${SAMPLE_PAN}, Aadhaar: 2541-7890-1234)`
        );
        successCount++;
      } catch (error) {
        console.log(
          `✗ Error creating ${transactionId}:`,
          error instanceof Error ? error.message : error
        );
        failureCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✓ Successfully created/updated: ${successCount}`);
    console.log(`✗ Failed: ${failureCount}`);
    console.log(`📝 Total: ${TRANSACTION_IDS.length}`);

    if (successCount === TRANSACTION_IDS.length) {
      console.log(`\n✨ All 15 transactions created successfully!`);
      console.log(
        `ℹ️  Admin should now see "80G Identity: Ready" badge for all transactions.`
      );
      process.exit(0);
    } else if (successCount > 0) {
      console.log(
        `\n⚠️  Partial success: ${successCount}/${TRANSACTION_IDS.length} created`
      );
      process.exit(1);
    } else {
      console.log(`\n❌ No transactions were created`);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Script error:", error);
    process.exit(1);
  }
}

seedTransactionsWithIdentity();
