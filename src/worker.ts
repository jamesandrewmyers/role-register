import { parentPort } from "worker_threads";
import { runInTransaction } from "@/lib/db";
import { processHtmlRecord } from "@/lib/htmlProcessor";
import * as eventInfoService from "@/services/eventInfoService";
import type { EventInfoId } from "@/domain/entities/eventInfo";
import type { DataReceivedId } from "@/domain/entities/dataReceived";

if (!parentPort) {
  throw new Error("Worker must be started with a parentPort");
}

// Max number of retries before marking as error
const MAX_RETRIES = 3;

parentPort.on("message", async (eventId: string) => {
  const job = eventInfoService.getEventById(eventId as EventInfoId);

  if (!job) {
    parentPort?.postMessage({
      eventId,
      status: "not_found",
    });
    return;
  }

  try {
    if (job.type === "processHtml") {
      const payload = JSON.parse(job.payload);
      console.log("Processing HTML for data_received ID: ", payload.dataReceivedId);

      let parsingLog: string;

      runInTransaction(() => {
        eventInfoService.updateEventStatus(eventId as EventInfoId, "processing");

        parsingLog = processHtmlRecord(payload.dataReceivedId as DataReceivedId);

        eventInfoService.updateEventStatus(eventId as EventInfoId, "done");
      });

      console.log(parsingLog);
    }

    parentPort?.postMessage({ eventId, status: "done" });
  } catch (err: unknown) {
    const retries = (job.retries ?? 0) + 1;

    try {
      runInTransaction(() => {
        if (retries < MAX_RETRIES) {
          // Put back into pending for retry
          eventInfoService.updateEventStatus(eventId as EventInfoId, "pending", String(err));
          eventInfoService.incrementEventRetries(eventId as EventInfoId);
        } else {
          // Mark as permanently failed
          eventInfoService.updateEventStatus(eventId as EventInfoId, "error", String(err));
          eventInfoService.incrementEventRetries(eventId as EventInfoId);
        }
      });

      parentPort?.postMessage({
        eventId,
        status: retries < MAX_RETRIES ? "retrying" : "error",
        retries,
        error: String(err),
      });
    } catch (dbErr: unknown) {
      console.error(`[Worker] Failed to update event status: ${String(dbErr)}`);
      parentPort?.postMessage({
        eventId,
        status: "error",
        retries,
        error: `${String(err)} (DB update failed: ${String(dbErr)})`,
      });
    }
  }
});
