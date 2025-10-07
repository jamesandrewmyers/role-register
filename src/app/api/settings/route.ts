import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const allSettings = db.select().from(settings).all();
    return NextResponse.json(allSettings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, value } = body;

    if (!name || value === undefined) {
      return NextResponse.json(
        { error: "Name and value are required" },
        { status: 400 }
      );
    }

    const existingSetting = db
      .select()
      .from(settings)
      .where(eq(settings.name, name))
      .get();

    if (existingSetting) {
      const updated = db
        .update(settings)
        .set({
          value,
          updatedAt: Math.floor(Date.now() / 1000),
        })
        .where(eq(settings.name, name))
        .run();

      const updatedSetting = db
        .select()
        .from(settings)
        .where(eq(settings.name, name))
        .get();

      return NextResponse.json(updatedSetting);
    } else {
      const newSetting = {
        id: randomUUID(),
        name,
        value,
        updatedAt: Math.floor(Date.now() / 1000),
      };

      db.insert(settings).values(newSetting).run();

      return NextResponse.json(newSetting, { status: 201 });
    }
  } catch (error) {
    console.error("Error saving setting:", error);
    return NextResponse.json(
      { error: "Failed to save setting" },
      { status: 500 }
    );
  }
}
