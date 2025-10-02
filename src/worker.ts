import { parentPort } from "worker_threads";
import { db } from "@/lib/db";
import { eventInfo, dataReceived } from "@/lib/schema";
import { eq } from "drizzle-orm";
import * as cheerio from "cheerio";

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
      .set({ status: "processing", updatedAt: new Date().valueOf() })
      .where(eq(eventInfo.id, eventId))
      .run();

    // 🧑‍💻 Do work based on event type
    if (job.type === "processHtml") {
      const payload = JSON.parse(job.payload);
      console.log("Processing HTML for data_received ID: ", payload.dataReceivedId);

      const dataRecord = db
        .select()
        .from(dataReceived)
        .where(eq(dataReceived.id, payload.dataReceivedId))
        .get();
    
      if (!dataRecord) {
        console.log(`Data record not found: ${payload.dataReceivedId}`);
        throw new Error(`Data record not found: ${payload.dataReceivedId}`);
      }

      const url = new URL(dataRecord.url);
      const $ = cheerio.load(dataRecord.html);
      
      let parsingLog = `[Parser] Processing ${dataRecord.url}\n`;

      if (url.hostname === "www.linkedin.com") {
        parsingLog += "[LinkedIn Parser] Parsing job posting...\n";

        const jobTitle =
          $(".job-details-jobs-unified-top-card__job-title").text().trim() ||
          "";

        const companyName =
          $(".job-details-jobs-unified-top-card__company-name").text().trim() ||
          "";

        const jobLocation =
          $(".job-details-jobs-unified-top-card__tertiary-description-container span.tvm__text")
            .map((_, el) => $(el).text().trim())
            .get()
            .find(txt => txt.length > 0) ||
          "";

        const jobDescription =
          $(".jobs-box__html-content").text().trim() ||
          "";

        parsingLog += `[LinkedIn Parser] Job Title: ${jobTitle}\n`;
        parsingLog += `[LinkedIn Parser] Company Name: ${companyName}\n`;
        parsingLog += `[LinkedIn Parser] Job Location: ${jobLocation}\n`;
        parsingLog += `[LinkedIn Parser] Job Description: ${jobDescription}\n`;
      } else {
        parsingLog += `[Parser] No parser configured for hostname: ${url.hostname}\n`;
      }

      // Store parsing log in processing notes for reliable verification
      db.update(dataReceived)
        .set({ 
          processingNotes: parsingLog,
          processed: "true" 
        })
        .where(eq(dataReceived.id, payload.dataReceivedId))
        .run();

      // Also log to console (may be buffered/unreliable)
      console.log(parsingLog);
    }

    // Mark as done
    db.update(eventInfo)
      .set({ status: "done", updatedAt: new Date().valueOf() })
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
          updatedAt: new Date().valueOf(),
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
          updatedAt: new Date().valueOf(),
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