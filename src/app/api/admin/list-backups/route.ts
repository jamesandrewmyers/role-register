import { NextResponse } from "next/server";
import { listBackups } from "@/lib/db";

export async function GET() {
  try {
    const backups = listBackups();
    
    return NextResponse.json({ 
      success: true, 
      backups: backups.map(b => ({
        fileName: b.fileName,
        fullPath: b.fullPath,
        displayName: b.displayName,
        timestamp: b.timestamp.toISOString()
      }))
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list backups";
    console.error("List backups error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: message
      },
      { status: 500 }
    );
  }
}
