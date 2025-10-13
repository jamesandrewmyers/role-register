import { NextResponse } from "next/server";
import { restoreFromBackup } from "@/lib/db";
import { pauseEventProcessing, resumeEventProcessing, terminateAllWorkers } from "@/lib/event";

export async function POST(request: Request) {
  try {
    const { backupPath } = await request.json();
    
    if (!backupPath) {
      return NextResponse.json(
        { success: false, error: "Backup path is required" },
        { status: 400 }
      );
    }

    pauseEventProcessing();
    await terminateAllWorkers();
    
    await restoreFromBackup(backupPath);
    
    resumeEventProcessing();

    return NextResponse.json({ 
      success: true, 
      message: "Database restored successfully from backup"
    });
  } catch (error) {
    resumeEventProcessing();
    
    const message = error instanceof Error ? error.message : "Failed to restore backup";
    console.error("Restore backup error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: message
      },
      { status: 500 }
    );
  }
}
