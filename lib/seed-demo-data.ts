import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const MARKER = "MCA-DEMO-SEED-2026";
const FIXED_80G_EMAIL = "glenmonteiro2410@gmail.com";

type SeedDonor = {
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  lastDonationDate?: Date;
};

const inactiveDonors: SeedDonor[] = [
  {
    name: "Ramesh Pai",
    email: "inactive01.demo@suraksha.org",
    phone: "9101000001",
    status: "inactive",
    lastDonationDate: new Date("2024-01-20T10:00:00.000Z"),
  },
  {
    name: "Savita Kulkarni",
    email: "inactive02.demo@suraksha.org",
    phone: "9101000002",
    status: "inactive",
    lastDonationDate: new Date("2023-11-11T10:00:00.000Z"),
  },
  {
    name: "Prakash Hegde",
    email: "inactive03.demo@suraksha.org",
    phone: "9101000003",
    status: "inactive",
    lastDonationDate: new Date("2024-02-05T10:00:00.000Z"),
  },
  {
    name: "Madhavi Naik",
    email: "inactive04.demo@suraksha.org",
    phone: "9101000004",
    status: "inactive",
    lastDonationDate: new Date("2024-03-08T10:00:00.000Z"),
  },
  {
    name: "Rohit Bhat",
    email: "inactive05.demo@suraksha.org",
    phone: "9101000005",
    status: "inactive",
    lastDonationDate: new Date("2023-10-02T10:00:00.000Z"),
  },
];

const activeDonors: SeedDonor[] = [
  { name: "Demo 80G Donor", email: FIXED_80G_EMAIL, phone: "9102000001", status: "active" },
  { name: "Anusha Shenoy", email: "active02.demo@suraksha.org", phone: "9102000002", status: "active" },
  { name: "Vikram Rao", email: "active03.demo@suraksha.org", phone: "9102000003", status: "active" },
  { name: "Shreya Nadkarni", email: "active04.demo@suraksha.org", phone: "9102000004", status: "active" },
  { name: "Harshit Gokhale", email: "active05.demo@suraksha.org", phone: "9102000005", status: "active" },
];

async function seedDemoData() {
  const { default: dbConnect } = await import("@/lib/mongodb");
  const { Donor, Donation } = await import("@/lib/models");

  await dbConnect();

  const allDonors = [...inactiveDonors, ...activeDonors];

  const donorDocs = await Promise.all(
    allDonors.map((donor) =>
      Donor.findOneAndUpdate(
        { email: donor.email.toLowerCase() },
        {
          $set: {
            name: donor.name,
            email: donor.email.toLowerCase(),
            phone: donor.phone,
            status: donor.status,
            lastDonationDate: donor.lastDonationDate,
          },
          $setOnInsert: {
            totalDonated: 0,
            donationCount: 0,
          },
        },
        { upsert: true, returnDocument: "after" }
      )
    )
  );

  const donorMap = new Map(
    donorDocs.map((doc) => [String(doc?.email).toLowerCase(), doc])
  );

  await Donation.deleteMany({ notes: MARKER });

  const now = new Date();
  const txns = [
    {
      donorEmail: FIXED_80G_EMAIL,
      amount: 7000,
      status: "success",
      requires80G: true,
      daysAgo: 1,
      method: "upi",
    },
    {
      donorEmail: FIXED_80G_EMAIL,
      amount: 10000,
      status: "success",
      requires80G: true,
      daysAgo: 2,
      method: "card",
    },
    {
      donorEmail: "active02.demo@suraksha.org",
      amount: 5000,
      status: "success",
      requires80G: false,
      daysAgo: 3,
      method: "netbanking",
    },
    {
      donorEmail: "active03.demo@suraksha.org",
      amount: 3500,
      status: "success",
      requires80G: false,
      daysAgo: 4,
      method: "wallet",
    },
    {
      donorEmail: "active04.demo@suraksha.org",
      amount: 2500,
      status: "failed",
      requires80G: false,
      daysAgo: 5,
      method: "upi",
    },
  ] as const;

  const donationDocs = txns.map((txn, idx) => {
    const donor = donorMap.get(txn.donorEmail.toLowerCase());
    if (!donor) {
      throw new Error(`Missing donor for ${txn.donorEmail}`);
    }

    const createdAt = new Date(now);
    createdAt.setUTCDate(now.getUTCDate() - txn.daysAgo);

    return {
      donorId: donor._id,
      donorName: donor.name,
      donorEmail: txn.requires80G ? FIXED_80G_EMAIL : donor.email,
      donorPhone: donor.phone,
      amount: txn.amount,
      method: txn.method,
      requires80G: txn.requires80G,
      status: txn.status,
      transactionId: `MCA-DEMO-${String(idx + 1).padStart(3, "0")}`,
      receiptGenerated: false,
      notes: MARKER,
      createdAt,
      updatedAt: createdAt,
    };
  });

  await Donation.insertMany(donationDocs, { ordered: true });

  for (const donor of donorDocs) {
    if (!donor) continue;

    const records = await Donation.find({ donorId: donor._id, notes: MARKER }).lean();
    const successful = records.filter((record) => record.status === "success" || record.status === "completed");

    const totalDonated = successful.reduce((sum, record) => sum + record.amount, 0);
    const donationCount = successful.length;
    const latest = successful
      .map((record) => record.createdAt)
      .sort((a, b) => +new Date(b) - +new Date(a))[0];

    await Donor.updateOne(
      { _id: donor._id },
      {
        $set: {
          totalDonated,
          donationCount,
          lastDonationDate: latest || donor.lastDonationDate,
          status: inactiveDonors.some((item) => item.email === donor.email)
            ? "inactive"
            : donationCount > 0
              ? "active"
              : donor.status,
        },
      }
    );
  }

  const inactiveCount = await Donor.countDocuments({
    email: { $in: inactiveDonors.map((d) => d.email.toLowerCase()) },
    status: "inactive",
  });

  const seededTransactions = await Donation.find({ notes: MARKER })
    .sort({ createdAt: -1 })
    .select("status amount donorEmail requires80G transactionId")
    .lean();

  const successCount = seededTransactions.filter((t) => t.status === "success").length;
  const failedCount = seededTransactions.filter((t) => t.status === "failed").length;

  console.log("MCA demo seed complete.");
  console.log(`Inactive donors: ${inactiveCount} (expected 5)`);
  console.log(`Transactions seeded: ${seededTransactions.length} (expected 5)`);
  console.log(`Success: ${successCount} (expected 4)`);
  console.log(`Failed: ${failedCount} (expected 1)`);
  console.log(`80G recipient hardcoded: ${FIXED_80G_EMAIL}`);
  process.exit(0);
}

seedDemoData().catch((error) => {
  console.error("Demo seed failed:", error);
  process.exit(1);
});
