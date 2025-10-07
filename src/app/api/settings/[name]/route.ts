import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const setting = db
      .select()
      .from(settings)
      .where(eq(settings.name, params.name))
      .get();

    if (!setting) {
      return NextResponse.json(
        { error: "Setting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error("Error fetching setting:", error);
    return NextResponse.json(
      { error: "Failed to fetch setting" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const body = await request.json();
    const { value } = body;

    if (value === undefined) {
      return NextResponse.json(
        { error: "Value is required" },
        { status: 400 }
      );
    }

    const existingSetting = db
      .select()
      .from(settings)
      .where(eq(settings.name, params.name))
      .get();

    if (!existingSetting) {
      return NextResponse.json(
        { error: "Setting not found" },
        { status: 404 }
      );
    }

    db.update(settings)
      .set({
        value,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(settings.name, params.name))
      .run();

    const updatedSetting = db
      .select()
      .from(settings)
      .where(eq(settings.name, params.name))
      .get();

    return NextResponse.json(updatedSetting);
  } catch (error) {
    console.error("Error updating setting:", error);
    return NextResponse.json(
      { error: "Failed to update setting" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const existingSetting = db
      .select()
      .from(settings)
      .where(eq(settings.name, params.name))
      .get();

    if (!existingSetting) {
      return NextResponse.json(
        { error: "Setting not found" },
        { status: 404 }
      );
    }

    db.delete(settings)
      .where(eq(settings.name, params.name))
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting setting:", error);
    return NextResponse.json(
      { error: "Failed to delete setting" },
      { status: 500 }
    );
  }
}
