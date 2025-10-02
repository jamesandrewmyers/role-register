import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { inArray } from "drizzle-orm";

export async function DELETE(request: Request) {
  try {
    const { tableName, ids } = await request.json();

    if (!tableName || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Table name and IDs are required" },
        { status: 400 }
      );
    }

    // Get the table from schema
    const table = (schema as any)[tableName];
    if (!table) {
      return NextResponse.json(
        { error: "Table not found in schema" },
        { status: 404 }
      );
    }

    // Delete rows by ID
    const result = await db
      .delete(table)
      .where(inArray(table.id, ids));

    return NextResponse.json({ 
      success: true, 
      deletedCount: ids.length 
    });
  } catch (error) {
    console.error("Failed to delete rows:", error);
    return NextResponse.json(
      { error: "Failed to delete rows" },
      { status: 500 }
    );
  }
}
