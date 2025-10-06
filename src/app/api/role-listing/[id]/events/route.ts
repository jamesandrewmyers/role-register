import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roleEvent } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const events = await db
      .select()
      .from(roleEvent)
      .where(eq(roleEvent.eventListingId, id));

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching role events:", error);
    return NextResponse.json(
      { error: "Failed to fetch role events" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { eventType, eventTitle, eventDate, eventNotes } = body;

    const newEvent = {
      id: randomUUID(),
      eventListingId: id,
      eventType,
      eventTitle,
      eventDate,
      eventNotes,
    };

    await db.insert(roleEvent).values(newEvent);

    return NextResponse.json(newEvent);
  } catch (error) {
    console.error("Error creating role event:", error);
    return NextResponse.json(
      { error: "Failed to create role event" },
      { status: 500 }
    );
  }
}
