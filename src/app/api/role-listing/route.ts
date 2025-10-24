import { NextRequest, NextResponse } from "next/server";
import * as roleListingService from "@/services/roleListingService";
import * as roleListingDTO from "@/dto/roleListing.dto";
import type { DataReceivedId } from "@/domain/entities/dataReceived";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dataReceivedId = searchParams.get("dataReceivedId");

    if (!dataReceivedId) {
      return NextResponse.json(
        { error: "dataReceivedId parameter is required" },
        { status: 400 }
      );
    }

    const listing = roleListingService.getListingByDataReceivedId(dataReceivedId as DataReceivedId);

    if (!listing) {
      return NextResponse.json(
        { error: "Role listing not found for this data_received record" },
        { status: 404 }
      );
    }

    return NextResponse.json(roleListingDTO.toDTO(listing));
  } catch (error) {
    console.error("Error fetching role listing:", error);
    return NextResponse.json(
      { error: "Failed to fetch role listing" },
      { status: 500 }
    );
  }
}
