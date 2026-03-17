import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import TrustDocument from "@/lib/models/TrustDocument";

// POST /api/admin/reset-db - Clear TrustDocument records for fresh re-ingestion
export async function POST() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedAdminEmail = (
      process.env.ADMIN_EMAIL || "glenmonteiro47@gmail.com"
    ).toLowerCase();

    const sessionEmail = String(session.user?.email || "").toLowerCase();
    if (!sessionEmail || sessionEmail !== allowedAdminEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const result = await TrustDocument.deleteMany({});

    return NextResponse.json({
      ok: true,
      message: "TrustDocument collection cleared successfully.",
      deletedCount: result.deletedCount ?? 0,
    });
  } catch (error) {
    console.error("POST /api/admin/reset-db error:", error);
    return NextResponse.json(
      { error: "Failed to reset TrustDocument collection" },
      { status: 500 }
    );
  }
}
