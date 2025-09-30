import { startQueueRunner } from "@/lib/queueRunner";

let started = false;

export async function register() {
  if (!started) {
    console.log("[Role Register] Starting event queue runner...");
    startQueueRunner();
    started = true;
  }
}

export async function unregister() {
  console.log("[Role Register] Server shutting down.");
}