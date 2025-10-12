import { parentPort } from "worker_threads";
import { randomUUID } from "node:crypto";
import * as cheerio from "cheerio";
import { extractRequirements } from "@/lib/requirementExtractor";
import { parseLinkedInJob } from "@/lib/linkedIn";
import { runInTransaction } from "@/lib/db";
import * as eventInfoService from "@/services/eventInfoService";
import * as dataReceivedService from "@/services/dataReceivedService";
import * as roleCompanyService from "@/services/roleCompanyService";
import * as roleListingService from "@/services/roleListingService";
import * as roleLocationService from "@/services/roleLocationService";
import * as roleStateService from "@/services/roleStateService";
import * as roleQualificationsService from "@/services/roleQualificationsService";
import type { EventInfoId } from "@/domain/entities/eventInfo";
import type { DataReceivedId } from "@/domain/entities/dataReceived";
import type { RoleCompanyId } from "@/domain/entities/roleCompany";
import type { RoleListingId } from "@/domain/entities/roleListing";
import type { RoleLocationId } from "@/domain/entities/roleLocation";
import type { RoleQualificationsId } from "@/domain/entities/roleQualifications";

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
    // 🧑‍💻 Do work based on event type
    if (job.type === "processHtml") {
      const payload = JSON.parse(job.payload);
      console.log("Processing HTML for data_received ID: ", payload.dataReceivedId);

      const dataRecord = dataReceivedService.getDataReceivedById(payload.dataReceivedId as DataReceivedId);
    
      if (!dataRecord) {
        console.log(`Data record not found: ${payload.dataReceivedId}`);
        throw new Error(`Data record not found: ${payload.dataReceivedId}`);
      }

      const url = new URL(dataRecord.url);
      const $ = cheerio.load(dataRecord.html);
      
      let parsingLog = `[Parser] Processing ${dataRecord.url}\n`;

      // Wrap ALL operations (including status updates) in single transaction
      runInTransaction(() => {
        // Mark as processing
        eventInfoService.updateEventStatus(eventId as EventInfoId, "processing");

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
            let companyId = roleCompanyService.getCompanyByName(companyName)?.id;
            
            if (!companyId) {
              companyId = randomUUID() as RoleCompanyId;
              roleCompanyService.createCompany({
                id: companyId,
                name: companyName,
                website: null,
              });
              parsingLog += `[Database] Created company: ${companyName}\n`;
            }
            
            let locationId: string | undefined;
            if (jobLocationRaw) {
              const locationParts = jobLocationRaw.split(',').map(p => p.trim());
              const city = locationParts[0] || '';
              const stateStr = locationParts[1] || '';
              
              if (city && stateStr !== null) {
                const state = roleStateService.getStateByAbbreviation(stateStr);
                
                if (state !== null) {
                  const existingLocation = roleLocationService.getLocationByCityAndState(city, state.id);
                  
                  if (existingLocation) {
                    locationId = existingLocation.id;
                  } else {
                    locationId = randomUUID();
                    roleLocationService.createLocation({
                      id: locationId as RoleLocationId,
                      city,
                      locationState: state.id,
                    });
                    parsingLog += `[Database] Created location: ${city}, ${stateStr}\n`;
                  }
                } else {
                  parsingLog += `[Database] State not found: ${stateStr}\n`;
                }
              }
            }
            
            const existingListing = roleListingService.getListingByDataReceivedId(payload.dataReceivedId as DataReceivedId);
            
            let listingId: string;
            
            if (existingListing) {
              listingId = existingListing.id as string;
              
              roleListingService.updateRoleListing(existingListing.id, {
                companyId: companyId as RoleCompanyId,
                title: jobTitle,
                description: jobDescription,
                location: locationId as RoleLocationId | undefined,
                workArrangement: workArrangement,
                capturedAt: Math.floor(new Date().valueOf() / 1000),
              });
              
              roleQualificationsService.deleteQualificationsByListingId(existingListing.id);
              
              parsingLog += `[Database] Updated existing role listing: ${jobTitle}\n`;
            } else {
              listingId = randomUUID();
              roleListingService.createRoleListing({
                id: listingId as RoleListingId,
                companyId: companyId as RoleCompanyId,
                title: jobTitle,
                description: jobDescription,
                location: locationId as RoleLocationId | null,
                workArrangement: workArrangement,
                capturedAt: Math.floor(new Date().valueOf() / 1000),
                dataReceivedId: payload.dataReceivedId as DataReceivedId,
                status: "new",
                appliedAt: null,
              });
              parsingLog += `[Database] Created role listing: ${jobTitle}\n`;
            }
            
            if (extracted.requirements.length > 0) {
              const requirements = extracted.requirements.filter(r => r.type === 'required');
              const niceToHaves = extracted.requirements.filter(r => r.type === 'nice-to-have');
              
              for (const req of requirements) {
                roleQualificationsService.createQualification({
                  id: randomUUID() as RoleQualificationsId,
                  listingId: listingId as RoleListingId,
                  description: req.text,
                  type: 'requirement',
                });
              }
              
              for (const nth of niceToHaves) {
                roleQualificationsService.createQualification({
                  id: randomUUID() as RoleQualificationsId,
                  listingId: listingId as RoleListingId,
                  description: nth.text,
                  type: 'nice to have',
                });
              }
              
              parsingLog += `[Database] Created ${requirements.length} requirements and ${niceToHaves.length} nice-to-haves\n`;
            }
          }
        }
      } else {
        parsingLog += `[Parser] No parser configured for hostname: ${url.hostname}\n`;
      }

        // Store parsing log in processing notes for reliable verification
        dataReceivedService.updateDataReceived(payload.dataReceivedId as DataReceivedId, {
          processingNotes: parsingLog,
          processed: "true",
        });

        // Mark as done - inside transaction for atomicity
        eventInfoService.updateEventStatus(eventId as EventInfoId, "done");
      });

      // Log to console (outside transaction - informational only)
      console.log(parsingLog);
    }

    parentPort?.postMessage({ eventId, status: "done" });
  } catch (err: unknown) {
    const retries = (job.retries ?? 0) + 1;

    if (retries < MAX_RETRIES) {
      // Put back into pending for retry
      eventInfoService.updateEventStatus(eventId as EventInfoId, "pending", String(err));
      eventInfoService.incrementEventRetries(eventId as EventInfoId);

      parentPort?.postMessage({
        eventId,
        status: "retrying",
        retries,
        error: String(err),
      });
    } else {
      // Mark as permanently failed
      eventInfoService.updateEventStatus(eventId as EventInfoId, "error", String(err));
      eventInfoService.incrementEventRetries(eventId as EventInfoId);

      parentPort?.postMessage({
        eventId,
        status: "error",
        retries,
        error: String(err),
      });
    }
  }
});
