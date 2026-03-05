import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

type DemoDonor = {
  name: string;
  email: string;
  phone: string;
};

const DONATIONS_PER_MONTH = 10;
const START_YEAR = 2025;
const START_MONTH_INDEX = 1; // February (0-based)

function monthsBetweenInclusive(startYear: number, startMonthIndex: number, endDate: Date) {
  const endYear = endDate.getUTCFullYear();
  const endMonth = endDate.getUTCMonth();
  return (endYear - startYear) * 12 + (endMonth - startMonthIndex) + 1;
}

const TOTAL_MONTHS = monthsBetweenInclusive(
  START_YEAR,
  START_MONTH_INDEX,
  new Date()
);
const TOTAL_DONATIONS = DONATIONS_PER_MONTH * TOTAL_MONTHS;
const SUCCESS_COUNT = Math.floor(TOTAL_DONATIONS * 0.95);
const FAIL_COUNT = TOTAL_DONATIONS - SUCCESS_COUNT;

const donors: DemoDonor[] = [
  { name: "Aarav Shah", email: "demo.donor01@suraksha.org", phone: "9000000001" },
  { name: "Vivaan Mehta", email: "demo.donor02@suraksha.org", phone: "9000000002" },
  { name: "Aditya Rao", email: "demo.donor03@suraksha.org", phone: "9000000003" },
  { name: "Krishna Patel", email: "demo.donor04@suraksha.org", phone: "9000000004" },
  { name: "Ishaan Nair", email: "demo.donor05@suraksha.org", phone: "9000000005" },
  { name: "Ananya Iyer", email: "demo.donor06@suraksha.org", phone: "9000000006" },
  { name: "Diya Kapoor", email: "demo.donor07@suraksha.org", phone: "9000000007" },
  { name: "Myra Joshi", email: "demo.donor08@suraksha.org", phone: "9000000008" },
  { name: "Siya Kulkarni", email: "demo.donor09@suraksha.org", phone: "9000000009" },
  { name: "Aadhya Reddy", email: "demo.donor10@suraksha.org", phone: "9000000010" },
  { name: "Rohan Verma", email: "demo.donor11@suraksha.org", phone: "9000000011" },
  { name: "Arjun Bhat", email: "demo.donor12@suraksha.org", phone: "9000000012" },
  { name: "Kabir Singh", email: "demo.donor13@suraksha.org", phone: "9000000013" },
  { name: "Yash Malhotra", email: "demo.donor14@suraksha.org", phone: "9000000014" },
  { name: "Neel Desai", email: "demo.donor15@suraksha.org", phone: "9000000015" },
  { name: "Riya Chawla", email: "demo.donor16@suraksha.org", phone: "9000000016" },
  { name: "Saanvi Goyal", email: "demo.donor17@suraksha.org", phone: "9000000017" },
  { name: "Kiara Sethi", email: "demo.donor18@suraksha.org", phone: "9000000018" },
  { name: "Meera Arora", email: "demo.donor19@suraksha.org", phone: "9000000019" },
  { name: "Nisha Menon", email: "demo.donor20@suraksha.org", phone: "9000000020" },
];

const amountPool = [500, 750, 1000, 1200, 1500, 2000, 2500, 3000, 5000];

async function seedDemoData() {
  const { default: dbConnect } = await import("@/lib/mongodb");
  const { Donor, Donation } = await import("@/lib/models");

  await dbConnect();

  const marker = `DEMO-SEED-${START_YEAR}-${String(START_MONTH_INDEX + 1).padStart(2, "0")}`;

  const existingDonors = await Donor.find({
    email: { $in: donors.map((d) => d.email) },
  }).select("_id email");

  const existingDonorIds = new Set(existingDonors.map((d) => String(d._id)));

  if (existingDonorIds.size > 0) {
    await Donation.deleteMany({
      donorId: { $in: Array.from(existingDonorIds) },
      notes: marker,
    });
  }

  const donorDocs = await Promise.all(
    donors.map((donor) =>
      Donor.findOneAndUpdate(
        { email: donor.email.toLowerCase() },
        {
          $set: {
            name: donor.name,
            email: donor.email.toLowerCase(),
            phone: donor.phone,
            status: "active",
          },
          $setOnInsert: {
            totalDonated: 0,
            donationCount: 0,
          },
        },
        { upsert: true, new: true }
      )
    )
  );

  const docs = [];
  let sequence = 1;

  for (let month = 0; month < TOTAL_MONTHS; month++) {
    for (let slot = 0; slot < DONATIONS_PER_MONTH; slot++) {
      const donor = donorDocs[(month * DONATIONS_PER_MONTH + slot) % donorDocs.length];
      const amount = amountPool[(month + slot) % amountPool.length];
      const isSuccess = sequence <= SUCCESS_COUNT;
      const day = 1 + ((slot * 2 + month) % 27);
      const createdAt = new Date(
        Date.UTC(START_YEAR, START_MONTH_INDEX + month, day, 9 + (slot % 8), 20, 0)
      );
      const transactionId = `DEMO-${createdAt.getUTCFullYear()}-${String(createdAt.getUTCMonth() + 1).padStart(2, "0")}-${String(slot + 1).padStart(3, "0")}`;

      docs.push({
        donorId: donor._id,
        donorName: donor.name,
        donorEmail: donor.email,
        donorPhone: donor.phone,
        amount,
        method: "other",
        status: isSuccess ? "completed" : "failed",
        transactionId,
        receiptGenerated: isSuccess,
        notes: marker,
        createdAt,
        updatedAt: createdAt,
      });

      sequence += 1;
    }
  }

  await Donation.deleteMany({ notes: marker });
  await Donation.insertMany(docs, { ordered: true });

  for (const donor of donorDocs) {
    const donorDonations = await Donation.find({ donorId: donor._id, notes: marker }).lean();
    const completed = donorDonations.filter((donation) => donation.status === "completed");
    const totalDonated = completed.reduce((sum, donation) => sum + donation.amount, 0);
    const donationCount = completed.length;
    const latest = completed
      .map((donation) => donation.createdAt)
      .sort((a, b) => +new Date(b) - +new Date(a))[0];

    await Donor.findByIdAndUpdate(donor._id, {
      $set: {
        totalDonated,
        donationCount,
        lastDonationDate: latest || donor.lastDonationDate,
        status: donationCount > 0 ? "active" : "inactive",
      },
    });
  }

  const firstMonthLabel = `${START_YEAR}-${String(START_MONTH_INDEX + 1).padStart(2, "0")}`;
  const now = new Date();
  const lastMonthLabel = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  console.log(`Demo seed complete from ${firstMonthLabel} to ${lastMonthLabel}.`);
  console.log(`Donors created/updated: ${donorDocs.length}`);
  console.log(`Donations inserted: ${docs.length}`);
  console.log(`Completed: ${SUCCESS_COUNT}`);
  console.log(`Failed: ${FAIL_COUNT}`);
  process.exit(0);
}

seedDemoData().catch((error) => {
  console.error("Demo seed failed:", error);
  process.exit(1);
});
