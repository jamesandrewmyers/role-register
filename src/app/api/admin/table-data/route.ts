import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { getTableColumns } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get("table");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!tableName) {
      return NextResponse.json(
        { error: "Table name is required" },
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

    // Get column definitions from Drizzle
    const tableColumns = getTableColumns(table);
    const columns = Object.entries(tableColumns).map(([name, col]: [string, any]) => ({
      name,
      type: col.columnType || "unknown",
      nullable: !col.notNull,
      primaryKey: col.primary || false,
    }));

    // Query data using Drizzle
    const rows = await db.select().from(table).limit(limit);

    return NextResponse.json({ columns, rows });
  } catch (error) {
    console.error("Failed to fetch table data:", error);
    return NextResponse.json(
      { error: "Failed to fetch table data" },
      { status: 500 }
    );
  }
}
