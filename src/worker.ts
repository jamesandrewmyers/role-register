import { parentPort } from "worker_threads";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { eventInfo, dataReceived, roleCompany, roleListing, roleLocation, roleState, roleQualifications } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import * as cheerio from "cheerio";
import { extractRequirements } from "@/lib/requirementExtractor";
import { parseLinkedInJob } from "@/lib/linkedIn";

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

        const { workArrangement, jobTitle, companyName, jobLocation: jobLocationRaw, jobDescription } = parseLinkedInJob($);

        parsingLog += `[LinkedIn Parser] Work Arrangement: ${workArrangement}\n`;
        parsingLog += `[LinkedIn Parser] Job Title: ${jobTitle}\n`;
        parsingLog += `[LinkedIn Parser] Company Name: ${companyName}\n`;
        parsingLog += `[LinkedIn Parser] Job Location: ${jobLocationRaw}\n`;
        //parsingLog += `[LinkedIn Parser] Job Description: ${jobDescription}\n`;

        if (jobDescription) {
          const extracted = extractRequirements(jobDescription);
          parsingLog += `\n[Requirement Extractor] ${extracted.summary}\n`;
          
          if (extracted.requirements.length > 0) {
            parsingLog += `[Requirement Extractor] Requirements by confidence:\n`;
            
            const required = extracted.requirements.filter(r => r.type === 'required');
            const niceToHave = extracted.requirements.filter(r => r.type === 'nice-to-have');
            
            if (required.length > 0) {
              parsingLog += `\nRequired (${required.length}):\n`;
              const byConfidence = {
                high: required.filter(r => r.confidence === 'high'),
                medium: required.filter(r => r.confidence === 'medium'),
                low: required.filter(r => r.confidence === 'low')
              };
              
              if (byConfidence.high.length > 0) {
                parsingLog += `  High Confidence (${byConfidence.high.length}):\n`;
                byConfidence.high.forEach(r => {
                  parsingLog += `    • ${r.text} [${r.category}]\n`;
                });
              }
              if (byConfidence.medium.length > 0) {
                parsingLog += `  Medium Confidence (${byConfidence.medium.length}):\n`;
                byConfidence.medium.forEach(r => {
                  parsingLog += `    • ${r.text} [${r.category}]\n`;
                });
              }
              if (byConfidence.low.length > 0) {
                parsingLog += `  Low Confidence (${byConfidence.low.length}):\n`;
                byConfidence.low.forEach(r => {
                  parsingLog += `    • ${r.text} [${r.category}]\n`;
                });
              }
            }
            
            if (niceToHave.length > 0) {
              parsingLog += `\nNice-to-Have (${niceToHave.length}):\n`;
              niceToHave.forEach(r => {
                parsingLog += `  • ${r.text} [${r.category}, ${r.confidence} confidence]\n`;
              });
            }
          }
          
          if (jobTitle && companyName && jobDescription) {
            let companyId = db
              .select({ id: roleCompany.id })
              .from(roleCompany)
              .where(eq(roleCompany.name, companyName))
              .get()?.id;
            
            if (!companyId) {
              companyId = randomUUID();
              db.insert(roleCompany)
                .values({
                  id: companyId,
                  name: companyName,
                })
                .run();
              parsingLog += `[Database] Created company: ${companyName}\n`;
            }
            
            let locationId: string | undefined;
            if (jobLocationRaw) {
              const locationParts = jobLocationRaw.split(',').map(p => p.trim());
              const city = locationParts[0] || '';
              const stateStr = locationParts[1] || '';
              
              if (city && stateStr) {
                const state = db
                  .select()
                  .from(roleState)
                  .where(eq(roleState.abbreviation, stateStr))
                  .get();
                
                if (state) {
                  const existingLocation = db
                    .select({ id: roleLocation.id })
                    .from(roleLocation)
                    .where(and(
                      eq(roleLocation.city, city),
                      eq(roleLocation.locationState, state.id)
                    ))
                    .get();
                  
                  if (existingLocation) {
                    locationId = existingLocation.id;
                  } else {
                    locationId = randomUUID();
                    db.insert(roleLocation)
                      .values({
                        id: locationId,
                        city,
                        locationState: state.id,
                      })
                      .run();
                    parsingLog += `[Database] Created location: ${city}, ${stateStr}\n`;
                  }
                } else {
                  parsingLog += `[Database] State not found: ${stateStr}\n`;
                }
              }
            }
            
            const existingListing = db
              .select({ id: roleListing.id })
              .from(roleListing)
              .where(eq(roleListing.dataReceivedId, payload.dataReceivedId))
              .get();
            
            let listingId: string;
            
            if (existingListing) {
              listingId = existingListing.id;
              
              db.update(roleListing)
                .set({
                  companyId,
                  title: jobTitle,
                  description: jobDescription,
                  location: locationId,
                  capturedAt: new Date().valueOf() / 1000,
                })
                .where(eq(roleListing.id, listingId))
                .run();
              
              db.delete(roleQualifications)
                .where(eq(roleQualifications.listingId, listingId))
                .run();
              
              parsingLog += `[Database] Updated existing role listing: ${jobTitle}\n`;
            } else {
              listingId = randomUUID();
              db.insert(roleListing)
                .values({
                  id: listingId,
                  companyId,
                  title: jobTitle,
                  description: jobDescription,
                  location: locationId,
                  dataReceivedId: payload.dataReceivedId,
                })
                .run();
              parsingLog += `[Database] Created role listing: ${jobTitle}\n`;
            }
            
            if (extracted.requirements.length > 0) {
              const requirements = extracted.requirements.filter(r => r.type === 'required');
              const niceToHaves = extracted.requirements.filter(r => r.type === 'nice-to-have');
              
              for (const req of requirements) {
                db.insert(roleQualifications)
                  .values({
                    id: randomUUID(),
                    listingId,
                    description: req.text,
                    type: 'requirement',
                  })
                  .run();
              }
              
              for (const nth of niceToHaves) {
                db.insert(roleQualifications)
                  .values({
                    id: randomUUID(),
                    listingId,
                    description: nth.text,
                    type: 'nice to have',
                  })
                  .run();
              }
              
              parsingLog += `[Database] Created ${requirements.length} requirements and ${niceToHaves.length} nice-to-haves\n`;
            }
          }
        }
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
