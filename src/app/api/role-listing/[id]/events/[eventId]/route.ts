import { NextRequest, NextResponse } from "next/server";
import * as roleEventService from "@/services/roleEventService";
import type { RoleEventId } from "@/domain/entities/roleEvent";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const body = await request.json();
    const { eventType, eventTitle, eventDate, eventNotes } = body;

    const result = roleEventService.updateRoleEvent(eventId as RoleEventId, {
      eventType,
      eventTitle,
      eventDate,
      eventNotes,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Role event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating role event:", error);
    return NextResponse.json(
      { error: "Failed to update role event" },
      { status: 500 }
    );
  }
}
