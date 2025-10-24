import { NextResponse } from "next/server";
import * as dataReceivedService from "@/services/dataReceivedService";
import * as roleListingService from "@/services/roleListingService";
import * as dataReceivedDTO from "@/dto/dataReceived.dto";
import type { DataReceivedId } from "@/domain/entities/dataReceived";

export interface DataReceivedWithListingDTO {
  id: string;
  url: string;
  title: string;
  html: string;
  text: string;
  receivedAt: number;
  processed: string;
  processingNotes?: string;
  roleListing?: {
    title: string;
    companyName: string;
  };
}

export async function GET() {
  try {
    const dataReceivedRecords = dataReceivedService.getAllDataReceived();

    const enrichedRecords: DataReceivedWithListingDTO[] = dataReceivedRecords.map((record) => {
      const baseDTO = dataReceivedDTO.toDTO(record);
      
      // Try to find associated role listing
      const roleListing = roleListingService.getListingByDataReceivedId(record.id as DataReceivedId);
      
      return {
        ...baseDTO,
        roleListing: roleListing ? {
          title: roleListing.title,
          companyName: roleListing.company.name
        } : undefined
      };
    });

    return NextResponse.json(enrichedRecords);
  } catch (error) {
    console.error("Error fetching data received records:", error);
    return NextResponse.json(
      { error: "Failed to fetch data received records" },
      { status: 500 }
    );
  }
}
