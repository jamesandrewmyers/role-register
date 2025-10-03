import { bus } from "@/lib/event";
import { db } from "@/lib/db";
import { eventInfo } from "@/lib/schema";
import { eq } from "drizzle-orm";

export function startQueueRunner() {
  console.log("[QueueRunner] Resuming pending jobs from last session");

  // 1. Reset interrupted jobs
  db.update(eventInfo)
    .set({ status: "pending" })
    .where(eq(eventInfo.status, "processing"))
    .run();

  // 2. Resume pending jobs from last session
  const pending = db
    .select()
    .from(eventInfo)
    .where(eq(eventInfo.status, "pending"))
    .all();

  // Re-emit to trigger processing
  for (const job of pending) {
    console.log(`[QueueRunner] Re-emitting unfinished job ${job.id}`);
    bus.emit("event.created", { id: job.id });
  }
}