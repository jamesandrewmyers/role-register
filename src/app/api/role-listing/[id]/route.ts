import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roleListing } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, appliedAt } = body;

    await db
      .update(roleListing)
      .set({
        status,
        appliedAt,
      })
      .where(eq(roleListing.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating role listing:", error);
    return NextResponse.json(
      { error: "Failed to update role listing" },
      { status: 500 }
    );
  }
}
