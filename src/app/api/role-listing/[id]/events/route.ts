import { NextRequest, NextResponse } from "next/server";
import * as roleEventService from "@/services/roleEventService";
import { toDTO, toDTOs } from "@/dto/roleEvent.dto";
import type { RoleListingId } from "@/domain/entities/roleListing";
import { randomUUID } from "crypto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const events = roleEventService.getEventsByListingId(id as RoleListingId);

    return NextResponse.json(toDTOs(events));
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

    const newEvent = roleEventService.createRoleEvent({
      id: randomUUID(),
      eventListingId: id,
      eventType,
      eventTitle,
      eventDate,
      eventNotes,
    });

    return NextResponse.json(toDTO(newEvent));
  } catch (error) {
    console.error("Error creating role event:", error);
    return NextResponse.json(
      { error: "Failed to create role event" },
      { status: 500 }
    );
  }
}
