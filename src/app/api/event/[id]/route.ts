import { Worker } from "worker_threads";
import { bus } from "@/lib/event";
import { db } from "@/lib/db";
import { eventInfo } from "@/lib/schema";
import { eq } from "drizzle-orm";
import path from "path";

export async function startQueueRunner() {
  // Reset interrupted jobs
  db.update(eventInfo)
    .set({ status: "pending" })
    .where(eq(eventInfo.status, "processing"))
    .run();

  // Listen for new events
  bus.on("event.created", ({ id }) => {
    const worker = new Worker(path.resolve(__dirname, "../worker.js"));
    worker.postMessage(id);

    worker.on("message", (msg) => {
      console.log("Worker finished:", msg);
      worker.terminate();
    });

    worker.on("error", (err) => {
      console.error("Worker error:", err);
    });
  });

  // Also kick off processing of any "pending" jobs from last session
  const pending = db.select().from(eventInfo).where(eq(eventInfo.status, "pending")).all();
  for (const job of pending) {
    bus.emit("event.created", { id: job.id });
  }
}