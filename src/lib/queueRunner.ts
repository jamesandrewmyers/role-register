import { Worker } from "worker_threads";
import { bus } from "@/lib/event";
import path from "path";

export function startQueueRunner() {
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
}