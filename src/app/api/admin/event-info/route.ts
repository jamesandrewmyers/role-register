import { NextResponse } from "next/server";
import * as eventInfoService from "@/services/eventInfoService";
import * as eventInfoDTO from "@/dto/eventInfo.dto";

export async function GET() {
  try {
    const events = eventInfoService.getAllEvents();
    const dtos = events.map(eventInfoDTO.toDTO);
    return NextResponse.json(dtos);
  } catch (error) {
    console.error("Error fetching event info records:", error);
    return NextResponse.json(
      { error: "Failed to fetch event info records" },
      { status: 500 }
    );
  }
}
