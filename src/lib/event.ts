import Emittery from "emittery";
import { Worker } from "worker_threads";
import path from "path";
import "./startup";

export const bus = new Emittery<{
  "event.created": { id: string };
}>();

const activeWorkers = new Set<Worker>();
let eventProcessingPaused = false;

export function pauseEventProcessing(): void {
  eventProcessingPaused = true;
  console.log("[Event Bus] Event processing paused");
}

export function resumeEventProcessing(): void {
  eventProcessingPaused = false;
  console.log("[Event Bus] Event processing resumed");
}

export async function terminateAllWorkers(): Promise<void> {
  console.log(`[Event Bus] Terminating ${activeWorkers.size} active workers`);
  const terminationPromises = Array.from(activeWorkers).map(worker => worker.terminate());
  await Promise.all(terminationPromises);
  activeWorkers.clear();
  console.log("[Event Bus] All workers terminated");
}

// Set up worker listener in the same context as the bus
bus.on("event.created", ({ id }) => {
  if (eventProcessingPaused) {
    console.log("[Event Bus] Event processing paused, skipping worker for event:", id);
    return;
  }

  console.log("[Event Bus] Starting worker for event:", id);
  const worker = new Worker(path.resolve(process.cwd(), "src/worker.js"), {
    execArgv: process.env.NODE_ENV === 'development' ? ['--inspect'] : []
  });
  
  activeWorkers.add(worker);
  worker.postMessage(id);

  worker.on("message", (msg) => {
    console.log("[Event Bus] Worker finished:", msg);
    activeWorkers.delete(worker);
    worker.terminate();
  });

  worker.on("error", (err) => {
    console.error("[Event Bus] Worker error:", err);
    activeWorkers.delete(worker);
  });
});

import { db } from "@/lib/db";
import { eventInfo } from "@/lib/schema";

export interface EventPayload {
  [key: string]: unknown;
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
