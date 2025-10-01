import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dataReceived, eventInfo, roleListing } from "@/lib/schema";

export async function GET() {
  try {
    const receivedData = db.select().from(dataReceived).all();
    const events = db.select().from(eventInfo).all();
    const listings = db.select().from(roleListing).all();

    return NextResponse.json({
      dataReceived: receivedData,
      eventInfo: events,
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
