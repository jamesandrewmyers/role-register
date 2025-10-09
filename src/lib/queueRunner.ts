import { bus } from "@/lib/event";
import * as eventInfoService from "@/services/eventInfoService";

export function startQueueRunner() {
  console.log("[QueueRunner] Resuming pending jobs from last session");

  // 1. Reset interrupted jobs
  eventInfoService.resetProcessingEvents();

  // 2. Resume pending jobs from last session
  const pending = eventInfoService.getPendingEvents();

  // Re-emit to trigger processing
  for (const job of pending) {
    console.log(`[QueueRunner] Re-emitting unfinished job ${job.id}`);
    bus.emit("event.created", { id: job.id as string });
  }
}