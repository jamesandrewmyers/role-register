import { Worker } from "worker_threads";
import { bus } from "@/lib/event";
import { db } from "@/lib/db";
import { eventInfo } from "@/lib/schema";
import { eq } from "drizzle-orm";
import path from "path";

export function startQueueRunner() {

  bus.on("event.created", ({ id }) => {
    console.log("Starting worker for event:", id);
    
    // Always use the JavaScript worker for compatibility
    const worker = new Worker(path.resolve(process.cwd(), "src/worker.js"));
    worker.postMessage(id);

    worker.on("message", (msg) => {
      console.log("Worker finished:", msg);
      worker.terminate();
    });

    worker.on("error", (err) => {
      console.error("Worker error:", err);
    });
  });

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