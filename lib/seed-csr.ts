import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const fiscalYear = "2025-26";
const totalFund = 80000000;

const sponsors = [
  { companyName: "TechCorp India", logoUrl: "", totalContributed: 12000000 },
  { companyName: "GreenLife Logistics", logoUrl: "", totalContributed: 10000000 },
  { companyName: "Apex Manufacturing", logoUrl: "", totalContributed: 9000000 },
  { companyName: "Veda Finserve", logoUrl: "", totalContributed: 11000000 },
  { companyName: "BlueOrbit Systems", logoUrl: "", totalContributed: 8000000 },
  { companyName: "SunRidge Infra", logoUrl: "", totalContributed: 10000000 },
  { companyName: "NorthBridge Retail", logoUrl: "", totalContributed: 9000000 },
  { companyName: "UrbanGrid Mobility", logoUrl: "", totalContributed: 11000000 },
];

const projects = [
  {
    title: "Mobile Telemedicine Van",
    description: "Healthcare on wheels for rural communities with diagnostics, tele-consultation, and referral support.",
    category: "Health",
    goalAmount: 9000000,
    coverImageUrl: "https://media.gettyimages.com/id/606095223/photo/veterinarian-standing-inside-mobile-clinic.jpg?s=612x612&w=0&k=20&c=soLff4zBjdh1uW2gZM0LRUcWkf6ryc2ooE2jlffAXSY=",
    status: "Open",
    livesImpacted: 8200,
    beneficiariesCount: 3100,
    location: "Uttara Kannada",
  },
  {
    title: "Digital Literacy Hubs",
    description: "Tablets, internet access, and digital curriculum for village schools and youth training batches.",
    category: "Education",
    goalAmount: 7500000,
    coverImageUrl: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=1200&q=80",
    status: "Funded",
    livesImpacted: 12000,
    beneficiariesCount: 5400,
    location: "Sirsi",
  },
  {
    title: "Smart Anganwadi Revamp",
    description: "Modernizing early childhood centers with safe infrastructure, nutrition, and smart learning tools.",
    category: "Education",
    goalAmount: 6800000,
    coverImageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80",
    status: "Open",
    livesImpacted: 6400,
    beneficiariesCount: 2600,
    location: "Hubballi Rural",
  },
  {
    title: "SHG Micro-Entrepreneurship",
    description: "Seed funding and market linkages for women-led self-help group businesses.",
    category: "Empowerment",
    goalAmount: 7200000,
    coverImageUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80",
    status: "Funded",
    livesImpacted: 5300,
    beneficiariesCount: 1900,
    location: "Belagavi",
  },
  {
    title: "Solar-Powered Rural Clinics",
    description: "24x7 emergency-ready clinics powered by solar energy with cold-chain support.",
    category: "Health",
    goalAmount: 8100000,
    coverImageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=1200&q=80",
    status: "Open",
    livesImpacted: 7100,
    beneficiariesCount: 2800,
    location: "Dharwad",
  },
  {
    title: "Clean Water ATM Network",
    description: "Community RO filtration kiosks with smart metering and local maintenance training.",
    category: "Environment",
    goalAmount: 6300000,
    coverImageUrl: "https://images.unsplash.com/photo-1502740479091-635887520276?w=1200&q=80",
    status: "Funded",
    livesImpacted: 14000,
    beneficiariesCount: 6200,
    location: "Karwar",
  },
  {
    title: "Skill-Up Sirsi",
    description: "Vocational training and garment-making center for employability and income generation.",
    category: "Empowerment",
    goalAmount: 7000000,
    coverImageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",
    status: "Open",
    livesImpacted: 4800,
    beneficiariesCount: 1700,
    location: "Sirsi",
  },
  {
    title: "Project Rakshak",
    description: "Self-defense and legal awareness program for adolescent girls and women.",
    category: "Empowerment",
    goalAmount: 5200000,
    coverImageUrl: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=1200&q=80",
    status: "Open",
    livesImpacted: 5600,
    beneficiariesCount: 2200,
    location: "Mysuru",
  },
  {
    title: "Climate-Resilient Farming",
    description: "Drip irrigation, soil advisory, and climate-smart crop planning for farmers.",
    category: "Environment",
    goalAmount: 8400000,
    coverImageUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80",
    status: "Open",
    livesImpacted: 9800,
    beneficiariesCount: 3500,
    location: "Haveri",
  },
  {
    title: "Emergency Medical Corpus",
    description: "Rapid-response corpus for life-saving surgeries and critical care support.",
    category: "Health",
    goalAmount: 7300000,
    coverImageUrl: "https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=1200&q=80",
    status: "Closed",
    livesImpacted: 2100,
    beneficiariesCount: 950,
    location: "Bengaluru",
  },
] as const;

async function seedCSR() {
  const { default: dbConnect } = await import("@/lib/mongodb");
  const { CSRProject, CorporateSponsor, CSRPledge } = await import("@/lib/models");

  await dbConnect();

  await CorporateSponsor.deleteMany({ fiscalYear });
  await CSRPledge.deleteMany({ fiscalYear });

  const sponsorDocs = [] as any[];
  for (const sponsor of sponsors) {
    const doc = await CorporateSponsor.create({
      ...sponsor,
      fiscalYear,
      isActive: true,
    });
    sponsorDocs.push(doc);
  }

  const sponsorAllocationTotal = sponsors.reduce(
    (sum, sponsor) => sum + sponsor.totalContributed,
    0
  );

  for (let index = 0; index < projects.length; index++) {
    const item = projects[index];
    const raisedAmount = Math.round(item.goalAmount * (item.status === "Funded" ? 1 : item.status === "Closed" ? 1 : 0.42));

    const project = await CSRProject.findOneAndUpdate(
      { title: item.title, fiscalYear },
      {
        $set: {
          ...item,
          raisedAmount,
          fiscalYear,
          csr1Tracking: "CSR-1 Registered",
          isFeatured: index < 4,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    const sponsor = sponsorDocs[index % sponsorDocs.length];
    const pledgeAmount = Math.round(raisedAmount * 0.7);

    await CSRPledge.create({
      projectId: project._id,
      companyName: sponsor.companyName,
      amount: pledgeAmount,
      status: "confirmed",
      contactName: "CSR Lead",
      contactEmail: `csr+${index + 1}@example.com`,
      notes: "Seed allocation for FY 2025-26",
      fiscalYear,
    });

    project.sponsoringCompanies = [sponsor._id];
    await project.save();

  }

  console.log("CSR seed complete.");
  console.log(`Fiscal Year: ${fiscalYear}`);
  console.log(`Projects seeded: ${projects.length}`);
  console.log(`Sponsors seeded: ${sponsors.length}`);
  console.log(`Total CSR Fund baseline: ₹${totalFund.toLocaleString("en-IN")}`);
  console.log(`Sponsor allocation total: ₹${sponsorAllocationTotal.toLocaleString("en-IN")}`);

  process.exit(0);
}

seedCSR().catch((error) => {
  console.error("CSR seed failed:", error);
  process.exit(1);
});
