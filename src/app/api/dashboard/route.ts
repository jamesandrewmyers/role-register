import { NextResponse } from "next/server";
import * as dataReceivedService from "@/services/dataReceivedService";
import * as eventInfoService from "@/services/eventInfoService";
import * as roleListingService from "@/services/roleListingService";
import { toDTO as dataReceivedToDTO } from "@/dto/dataReceived.dto";
import { toDTO as eventInfoToDTO } from "@/dto/eventInfo.dto";
import { toDTO as roleListingToDTO } from "@/dto/roleListing.dto";
import { toDTO as roleCompanyToDTO } from "@/dto/roleCompany.dto";
import { toDTO as roleLocationToDTO } from "@/dto/roleLocation.dto";

export async function GET() {
  try {
    const receivedData = dataReceivedService.getAllDataReceived();
    const events = eventInfoService.getAllEvents();
    const rawListings = roleListingService.getAllRoleListings();

    // Enrich listings with company and location data
    const listings = rawListings.map((listing) => {
      const enriched = roleListingService.getRoleListingWithRelations(listing.id);
      return enriched ? {
        ...roleListingToDTO(enriched),
        company: enriched.company ? roleCompanyToDTO(enriched.company) : null,
        location: enriched.locationDetails && enriched.stateDetails 
          ? roleLocationToDTO(enriched.locationDetails, enriched.stateDetails) 
          : null,
      } : roleListingToDTO(listing);
    });

    return NextResponse.json({
      dataReceived: receivedData.map(dataReceivedToDTO),
      eventInfo: events.map(eventInfoToDTO),
      roleListings: listings,
    });
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
