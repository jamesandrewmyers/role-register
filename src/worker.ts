import { parentPort } from "worker_threads";
import { db } from "@/lib/db";
import { eventInfo } from "@/lib/schema";
import { eq } from "drizzle-orm";

if (!parentPort) {
  throw new Error("Worker must be started with a parentPort");
}

// Max number of retries before marking as error
const MAX_RETRIES = 3;

parentPort.on("message", async (eventId: string) => {
  const job = db
    .select()
    .from(eventInfo)
    .where(eq(eventInfo.id, eventId))
    .get();

  if (!job) {
    parentPort?.postMessage({
      eventId,
      status: "not_found",
    });
    return;
  }

  try {
    // Mark as processing
    db.update(eventInfo)
      .set({ status: "processing", updatedAt: new Date().toISOString() })
      .where(eq(eventInfo.id, eventId))
      .run();

    // 🧑‍💻 Do work based on event type
    if (job.type === "processHtml") {
      const payload = JSON.parse(job.payload);
      console.log("Processing HTML for data_received ID: ", payload.dataReceivedId);

      // TODO: implement actual HTML parsing/processing here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate work
    }

    // Mark as done
    db.update(eventInfo)
      .set({ status: "done", updatedAt: new Date().toISOString() })
      .where(eq(eventInfo.id, eventId))
      .run();

    parentPort?.postMessage({ eventId, status: "done" });
  } catch (err: any) {
    const retries = (job.retries ?? 0) + 1;

    if (retries < MAX_RETRIES) {
      // Put back into pending for retry
      db.update(eventInfo)
        .set({
          status: "pending",
          retries,
          updatedAt: new Date().toISOString(),
          error: String(err),
        })
        .where(eq(eventInfo.id, eventId))
        .run();

      parentPort?.postMessage({
        eventId,
        status: "retrying",
        retries,
        error: String(err),
      });
    } else {
      // Mark as permanently failed
      db.update(eventInfo)
        .set({
          status: "error",
          retries,
          updatedAt: new Date().toISOString(),
          error: String(err),
        })
        .where(eq(eventInfo.id, eventId))
        .run();

      parentPort?.postMessage({
        eventId,
        status: "error",
        retries,
        error: String(err),
      });
    }
  }
});