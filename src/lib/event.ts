import Emittery from "emittery";
import { Worker } from "worker_threads";
import path from "path";

export const bus = new Emittery<{
  "event.created": { id: string };
}>();

// Set up worker listener in the same context as the bus
bus.on("event.created", ({ id }) => {
  console.log("[Event Bus] Starting worker for event:", id);
  const worker = new Worker(path.resolve(process.cwd(), "src/worker.js"));
  worker.postMessage(id);

  worker.on("message", (msg) => {
    console.log("[Event Bus] Worker finished:", msg);
    worker.terminate();
  });

  worker.on("error", (err) => {
    console.error("[Event Bus] Worker error:", err);
  });
});

import { db } from "@/lib/db";
import { eventInfo } from "@/lib/schema";

export interface EventPayload {
  [key: string]: any;
}

export async function enqueueEvent(
  type: string,
  payload: EventPayload
): Promise<{ id: string }> {
  const id = crypto.randomUUID();

  db.insert(eventInfo).values({
    id,
    type,
    payload: JSON.stringify(payload),
    status: "pending",
  }).run();

  // Notify queue runner to spawn worker
  console.log("[Event] Emitting event.created for:", id);
  bus.emit("event.created", { id });

  return { id };
}
