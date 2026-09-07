import { NextResponse } from "next/server";
import { isCsrSectionEnabled } from "@/lib/section-visibility";

// GET /api/public/settings - unauthenticated, whitelisted public flags only.
export async function GET() {
  try {
    const csrProjectsEnabled = await isCsrSectionEnabled();
    return NextResponse.json({ csrProjectsEnabled });
  } catch (error) {
    console.error("GET /api/public/settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch public settings" },
      { status: 500 }
    );
  }
}
