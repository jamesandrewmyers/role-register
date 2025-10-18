import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roleLineItems } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import type { RoleListingId } from "@/domain/entities/roleListing";
import type { LineItemType } from "@/domain/entities/roleLineItems";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as LineItemType | null;

    const conditions = [eq(roleLineItems.listingId, params.id as RoleListingId)];
    
    if (type) {
      conditions.push(eq(roleLineItems.type, type));
    }

    const items = db
      .select()
      .from(roleLineItems)
      .where(and(...conditions))
      .all();

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching line items:", error);
    return NextResponse.json(
      { error: "Failed to fetch line items" },
      { status: 500 }
    );
  }
}
