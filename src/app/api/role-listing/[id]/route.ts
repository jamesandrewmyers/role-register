import { NextRequest, NextResponse } from "next/server";
import * as roleListingService from "@/services/roleListingService";
import type { RoleListingId } from "@/domain/entities/roleListing";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, appliedAt } = body;

    const result = roleListingService.updateRoleListingStatus(
      id as RoleListingId,
      status,
      appliedAt
    );

    if (!result) {
      return NextResponse.json(
        { error: "Role listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating role listing:", error);
    return NextResponse.json(
      { error: "Failed to update role listing" },
      { status: 500 }
    );
  }
}
