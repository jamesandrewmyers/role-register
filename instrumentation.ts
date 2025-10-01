let started = false;

export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") {
    return;
  }

  if (!started) {
    console.log("[Role Register] Starting event queue runner...");
    const { startQueueRunner } = await import("./src/lib/queueRunner");
    startQueueRunner();
    started = true;
  }
}

export async function unregister() {
  console.log("[Role Register] Server shutting down.");
}