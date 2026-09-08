import { loadEnvConfig } from "@next/env";
import bcrypt from "bcryptjs";

loadEnvConfig(process.cwd());

async function updatePassword() {
  const { default: dbConnect } = await import("@/lib/mongodb");
  const { User } = await import("@/lib/models");

  await dbConnect();

  const adminEmail = process.env.ADMIN_EMAIL || "glenmonteiro47@gmail.com";
  const newPassword = "Glen@SCTIN7175";
  const passwordHash = await bcrypt.hash(newPassword, 10);

  const user = await User.findOneAndUpdate(
    { email: adminEmail.toLowerCase() },
    { $set: { password: passwordHash } },
    { new: true }
  );

  if (!user) {
    console.error(`No user found with email: ${adminEmail}`);
    process.exit(1);
  }

  console.log(`Admin password updated for: ${adminEmail}`);
  process.exit(0);
}

updatePassword().catch((error) => {
  console.error("Failed to update password:", error);
  process.exit(1);
});
