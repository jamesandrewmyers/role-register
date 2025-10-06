import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roleEvent } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const body = await request.json();
    const { eventType, eventTitle, eventDate, eventNotes } = body;

    await db
      .update(roleEvent)
      .set({
        eventType,
        eventTitle,
        eventDate,
        eventNotes,
      })
      .where(eq(roleEvent.id, eventId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating role event:", error);
    return NextResponse.json(
      { error: "Failed to update role event" },
      { status: 500 }
    );
  }
}
