import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const DEMO_MARKER = "MCA-DEMO-SEED-2026";

async function cleanup() {
  const { default: dbConnect } = await import("@/lib/mongodb");
  const { Donor, Donation } = await import("@/lib/models");

  await dbConnect();

  const demoDonorEmails = [
    "inactive01.demo@suraksha.org",
    "inactive02.demo@suraksha.org",
    "inactive03.demo@suraksha.org",
    "inactive04.demo@suraksha.org",
    "inactive05.demo@suraksha.org",
    "active02.demo@suraksha.org",
    "active03.demo@suraksha.org",
    "active04.demo@suraksha.org",
    "active05.demo@suraksha.org",
    "glenmonteiro2410@gmail.com",
  ];

  const donationResult = await Donation.deleteMany({ notes: DEMO_MARKER });
  console.log(`Deleted ${donationResult.deletedCount} demo donations`);

  const donorResult = await Donor.deleteMany({
    email: { $in: demoDonorEmails.map((e) => e.toLowerCase()) },
  });
  console.log(`Deleted ${donorResult.deletedCount} demo donors`);

  console.log("Demo data cleanup complete.");
  process.exit(0);
}

cleanup().catch((error) => {
  console.error("Cleanup failed:", error);
  process.exit(1);
});
