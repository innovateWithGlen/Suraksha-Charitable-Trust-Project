import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Setting } from "@/lib/models";
import { settingsUpdateSchema } from "@/lib/validations";

// GET /api/settings
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const settings = await Setting.find({}).sort({ category: 1, key: 1 }).lean();

    // Convert to key-value map grouped by category
    const grouped: Record<string, Record<string, string>> = {};
    for (const s of settings) {
      if (!grouped[s.category]) grouped[s.category] = {};
      grouped[s.category][s.key] = s.value;
    }

    return NextResponse.json({ settings, grouped });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Bulk update settings
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { settings } = settingsUpdateSchema.parse(body);

    const operations = settings.map((setting) => ({
      updateOne: {
        filter: { key: setting.key },
        update: {
          $set: {
            value: setting.value,
            ...(setting.category && { category: setting.category }),
            ...(setting.description && { description: setting.description }),
          },
        },
        upsert: true,
      },
    }));

    await Setting.bulkWrite(operations);

    const updated = await Setting.find({}).lean();

    return NextResponse.json({ settings: updated });
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
