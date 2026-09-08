import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function cleanup() {
  const { default: dbConnect } = await import("@/lib/mongodb");
  const { Donor, Donation, CSRProject, CorporateSponsor, CSRPledge, CSRExpense } = await import("@/lib/models");

  await dbConnect();

  const donorResult = await Donor.deleteMany({});
  console.log(`Deleted ${donorResult.deletedCount} donors`);

  const donationResult = await Donation.deleteMany({});
  console.log(`Deleted ${donationResult.deletedCount} donations`);

  const csrProjectResult = await CSRProject.deleteMany({});
  console.log(`Deleted ${csrProjectResult.deletedCount} CSR projects`);

  const sponsorResult = await CorporateSponsor.deleteMany({});
  console.log(`Deleted ${sponsorResult.deletedCount} corporate sponsors`);

  const pledgeResult = await CSRPledge.deleteMany({});
  console.log(`Deleted ${pledgeResult.deletedCount} CSR pledges`);

  const expenseResult = await CSRExpense.deleteMany({});
  console.log(`Deleted ${expenseResult.deletedCount} CSR expenses`);

  console.log("\nAll demo data cleaned. Admin user, settings, content, and gallery preserved.");
  process.exit(0);
}

cleanup().catch((error) => {
  console.error("Cleanup failed:", error);
  process.exit(1);
});
// npx tsx scripts/cleanup-all-data.ts