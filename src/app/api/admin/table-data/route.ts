import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { getTableColumns, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get("table");
    const limit = parseInt(searchParams.get("limit") || "5");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!tableName) {
      return NextResponse.json(
        { error: "Table name is required" },
        { status: 400 }
      );
    }

    // Get the table from schema
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = (schema as Record<string, any>)[tableName];
    if (!table) {
      return NextResponse.json(
        { error: "Table not found in schema" },
        { status: 404 }
      );
    }

    // Get column definitions from Drizzle
    const tableColumns = getTableColumns(table);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const columns = Object.entries(tableColumns).map(([name, col]: [string, any]) => ({
      name,
      type: col.columnType || "unknown",
      nullable: !col.notNull,
      primaryKey: col.primary || false,
    }));

    // Get total count
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(table);
    const totalCount = countResult[0]?.count || 0;

    // Query data using Drizzle with offset
    const rows = await db.select().from(table).limit(limit).offset(offset);

    return NextResponse.json({ columns, rows, totalCount });
  } catch (error) {
    console.error("Failed to fetch table data:", error);
    return NextResponse.json(
      { error: "Failed to fetch table data" },
      { status: 500 }
    );
  }
}
