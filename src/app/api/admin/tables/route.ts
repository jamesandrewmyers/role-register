import { NextResponse } from "next/server";
import * as schema from "@/lib/schema";

export async function GET() {
  try {
    // Get all table names from the schema
    const tables = Object.keys(schema).sort();

    return NextResponse.json({ tables });
  } catch (error) {
    console.error("Failed to fetch tables:", error);
    return NextResponse.json(
      { error: "Failed to fetch tables" },
      { status: 500 }
    );
  }
}
