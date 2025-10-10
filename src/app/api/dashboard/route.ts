import { NextResponse } from "next/server";
import * as dataReceivedService from "@/services/dataReceivedService";
import * as eventInfoService from "@/services/eventInfoService";
import * as roleListingService from "@/services/roleListingService";
import { toDTO as dataReceivedToDTO } from "@/dto/dataReceived.dto";
import { toDTO as eventInfoToDTO } from "@/dto/eventInfo.dto";
import { toDTO as roleListingToDTO } from "@/dto/roleListing.dto";

export async function GET() {
  try {
    const receivedData = dataReceivedService.getAllDataReceived();
    const events = eventInfoService.getAllEvents();
    const listings = roleListingService.getAllRoleListings();

    return NextResponse.json({
      dataReceived: receivedData.map(dataReceivedToDTO),
      eventInfo: events.map(eventInfoToDTO),
      roleListings: listings.map(roleListingToDTO),
    });
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
