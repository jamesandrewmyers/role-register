import { NextResponse } from "next/server";
import { performBackup, getCurrentDatabasePath } from "@/lib/db";
import path from "path";
import fs from "fs";

export async function POST() {
  try {
    const currentDbPath = getCurrentDatabasePath();
    const dbDir = path.dirname(currentDbPath);
    const dbFileName = path.basename(currentDbPath, '.sqlite');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `${dbFileName}_backup_${timestamp}.sqlite`;
    const backupPath = path.join(dbDir, backupFileName);

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    await performBackup(backupPath);

    return NextResponse.json({ 
      success: true, 
      backupPath,
      message: `Backup created successfully at ${backupPath}`
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create backup";
    console.error("Backup error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: message
      },
      { status: 500 }
    );
  }
}
