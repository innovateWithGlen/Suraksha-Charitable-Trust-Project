import { loadEnvConfig } from "@next/env";
import bcrypt from "bcryptjs";

loadEnvConfig(process.cwd());

async function seed() {
  const { default: dbConnect } = await import("@/lib/mongodb");
  const { User, Content, Setting } = await import("@/lib/models");

  await dbConnect();

  const adminEmail = process.env.ADMIN_EMAIL || "glenmonteiro47@gmail.com";
  const defaultPassword = "Glen@SCTIN7571";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  await User.findOneAndUpdate(
    { email: adminEmail.toLowerCase() },
    {
      $set: {
        name: "Admin User",
        email: adminEmail.toLowerCase(),
        password: passwordHash,
        role: "superadmin",
        provider: "credentials",
      },
    },
    { upsert: true, new: true }
  );

  const seedContent = [
    {
      type: "hero",
      title: "Suraksha Charitable Trust (R)",
      subtitle: "Suraksha Charitable Trust",
      content:
        "Join us in supporting education, healthcare, and sustainable livelihoods for underprivileged communities.",
      order: 1,
      isActive: true,
    },
    {
      type: "faq",
      title: "Is my donation tax deductible?",
      content:
        "Yes, donations are eligible for tax deduction under Section 80G and a certificate is issued after successful payment.",
      order: 1,
      isActive: true,
    },
    {
      type: "program",
      title: "Education Support",
      content:
        "Scholarships, school kits, and after-school mentoring for underserved children.",
      order: 1,
      isActive: true,
    },
  ] as const;

  for (const item of seedContent) {
    await Content.findOneAndUpdate(
      { type: item.type, title: item.title },
      { $set: item },
      { upsert: true }
    );
  }

  const settings = [
    { key: "orgName", value: "Suraksha Charitable Trust", category: "general" },
    { key: "csrProjectsEnabled", value: "true", category: "general" },
    { key: "orgEmail", value: "savermonteiro@gmail.com", category: "general" },
    { key: "orgPhone", value: "+91 7892351129", category: "general" },
    { key: "whatsApp", value: process.env.NEXT_PUBLIC_TRUST_WHATSAPP_NUMBER || "917892351129", category: "social" },
  ] as const;

  for (const setting of settings) {
    await Setting.findOneAndUpdate(
      { key: setting.key },
      { $set: setting },
      { upsert: true }
    );
  }

  console.log("Seed complete.");
  console.log(`Admin email: ${adminEmail}`);
  console.log(`Admin password: ${defaultPassword} (change after first login)`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
