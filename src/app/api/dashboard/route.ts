import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dataReceived, eventInfo, roleListing, roleCompany, roleLocation, roleState } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const receivedData = db.select().from(dataReceived).all();
    const events = db.select().from(eventInfo).all();
    const rawListings = db.select().from(roleListing).all();

    // Enrich listings with company and location data
    const listings = rawListings.map((listing) => {
      let company = null;
      let location = null;

      if (listing.companyId) {
        const companyResult = db
          .select()
          .from(roleCompany)
          .where(eq(roleCompany.id, listing.companyId))
          .get();
        company = companyResult;
      }

      if (listing.location) {
        const locationResult = db
          .select({
            id: roleLocation.id,
            city: roleLocation.city,
            stateName: roleState.name,
            stateAbbreviation: roleState.abbreviation,
          })
          .from(roleLocation)
          .leftJoin(roleState, eq(roleLocation.locationState, roleState.id))
          .where(eq(roleLocation.id, listing.location))
          .get();
        location = locationResult;
      }

      return {
        ...listing,
        company,
        location,
      };
    });

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
