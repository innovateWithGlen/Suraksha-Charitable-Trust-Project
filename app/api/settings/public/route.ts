import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Setting } from "@/lib/models";

const allowedKeys = [
  "orgName",
  "orgEmail",
  "orgPhone",
  "orgAddress",
  "workingHours",
  "whatsApp",
];

export async function GET() {
  try {
    await dbConnect();

    const settings = await Setting.find({ key: { $in: allowedKeys } }).lean();
    const map: Record<string, string> = {};

    for (const setting of settings) {
      map[setting.key] = setting.value;
    }

    return NextResponse.json({ settings: map });
  } catch (error) {
    console.error("GET /api/settings/public error:", error);
    return NextResponse.json(
      { error: "Failed to fetch public settings" },
      { status: 500 }
    );
  }
}
