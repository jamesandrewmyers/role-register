import { parentPort } from "worker_threads";
import { randomUUID } from "node:crypto";
import * as cheerio from "cheerio";
import { parseHtml, htmlToPlainText, parseVisualSections } from "@/lib/htmlParser";
import { extractDescriptionDetails } from "@/lib/listingDescriptionExtractor";
import { parseLinkedInJob } from "@/lib/sites/linkedIn";
import { parseIndeedJob } from "@/lib/sites/indeed";
import { runInTransaction } from "@/lib/db";
import * as eventInfoService from "@/services/eventInfoService";
import * as dataReceivedService from "@/services/dataReceivedService";
import * as roleCompanyService from "@/services/roleCompanyService";
import * as roleListingService from "@/services/roleListingService";
import * as roleLocationService from "@/services/roleLocationService";
import * as roleStateService from "@/services/roleStateService";
import * as roleLineItemsService from "@/services/roleLineItemsService";
import type { EventInfoId } from "@/domain/entities/eventInfo";
import type { DataReceivedId } from "@/domain/entities/dataReceived";
import type { RoleCompanyId } from "@/domain/entities/roleCompany";
import type { RoleListingId } from "@/domain/entities/roleListing";
import type { RoleLocationId } from "@/domain/entities/roleLocation";
import type { RoleLineItemsId } from "@/domain/entities/roleLineItems";

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
          const nodes = parseHtml("<div>"+jobDescription+"</div>");
          const sections = nodes.length > 0 ? parseVisualSections(nodes[0]) : [];
          const extracted = extractDescriptionDetails(sections);
          
          const totalItems = extracted.requirements.length + extracted.nicetohave.length + extracted.responsibilities.length + extracted.benefits.length;
          parsingLog += `\n[Description Extractor] Extracted ${totalItems} items from ${sections.length} sections\n`;
          
          if (extracted.requirements.length > 0) {
            parsingLog += `\nRequirements (${extracted.requirements.length}):\n`;
            extracted.requirements.forEach(req => {
              parsingLog += `  • ${req}\n`;
            });
          }
          
          if (extracted.nicetohave.length > 0) {
            parsingLog += `\nNice to Have (${extracted.nicetohave.length}):\n`;
            extracted.nicetohave.forEach(nth => {
              parsingLog += `  • ${nth}\n`;
            });
          }
          
          if (extracted.responsibilities.length > 0) {
            parsingLog += `\nResponsibilities (${extracted.responsibilities.length}):\n`;
            extracted.responsibilities.forEach(resp => {
              parsingLog += `  • ${resp}\n`;
            });
          }
          
          if (extracted.benefits.length > 0) {
            parsingLog += `\nBenefits (${extracted.benefits.length}):\n`;
            extracted.benefits.forEach(ben => {
              parsingLog += `  • ${ben}\n`;
            });
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
              
              roleLineItemsService.deleteLineItemsByListingId(existingListing.id);
              
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
            
            const lineItemsToCreate = [
              ...extracted.requirements.map(text => ({
                id: randomUUID() as RoleLineItemsId,
                listingId: listingId as RoleListingId,
                description: text,
                type: 'requirement' as const,
              })),
              ...extracted.nicetohave.map(text => ({
                id: randomUUID() as RoleLineItemsId,
                listingId: listingId as RoleListingId,
                description: text,
                type: 'nicetohave' as const,
              })),
              ...extracted.responsibilities.map(text => ({
                id: randomUUID() as RoleLineItemsId,
                listingId: listingId as RoleListingId,
                description: text,
                type: 'responsibility' as const,
              })),
              ...extracted.benefits.map(text => ({
                id: randomUUID() as RoleLineItemsId,
                listingId: listingId as RoleListingId,
                description: text,
                type: 'benefit' as const,
              })),
            ];
            
            if (lineItemsToCreate.length > 0) {
              for (const item of lineItemsToCreate) {
                roleLineItemsService.createLineItem(item);
              }
              parsingLog += `[Database] Created ${extracted.requirements.length} requirements, ${extracted.nicetohave.length} nice-to-haves, ${extracted.responsibilities.length} responsibilities, and ${extracted.benefits.length} benefits\n`;
            }
          }
        }
      } else if (url.hostname === "www.indeed.com") {
        parsingLog += "[Indeed Parser] Parsing job posting...\n";

        const { workArrangement, jobTitle, companyName, jobLocation: jobLocationRaw, jobDescription } = parseIndeedJob($);

        parsingLog += `[Indeed Parser] Work Arrangement: ${workArrangement}\n`;
        parsingLog += `[Indeed Parser] Job Title: ${jobTitle}\n`;
        parsingLog += `[Indeed Parser] Company Name: ${companyName}\n`;
        parsingLog += `[Indeed Parser] Job Location: ${jobLocationRaw}\n`;

        if (jobDescription) {
          const nodes = parseHtml(jobDescription);
          const sections = nodes.length > 0 ? parseVisualSections(nodes[0]) : [];
          const extracted = extractDescriptionDetails(sections);
          
          const totalItems = extracted.requirements.length + extracted.nicetohave.length + extracted.responsibilities.length + extracted.benefits.length;
          parsingLog += `\n[Description Extractor] Extracted ${totalItems} items from ${sections.length} sections\n`;
          
          if (extracted.requirements.length > 0) {
            parsingLog += `\nRequirements (${extracted.requirements.length}):\n`;
            extracted.requirements.forEach(req => {
              parsingLog += `  • ${req}\n`;
            });
          }
          
          if (extracted.nicetohave.length > 0) {
            parsingLog += `\nNice to Have (${extracted.nicetohave.length}):\n`;
            extracted.nicetohave.forEach(nth => {
              parsingLog += `  • ${nth}\n`;
            });
          }
          
          if (extracted.responsibilities.length > 0) {
            parsingLog += `\nResponsibilities (${extracted.responsibilities.length}):\n`;
            extracted.responsibilities.forEach(resp => {
              parsingLog += `  • ${resp}\n`;
            });
          }
          
          if (extracted.benefits.length > 0) {
            parsingLog += `\nBenefits (${extracted.benefits.length}):\n`;
            extracted.benefits.forEach(ben => {
              parsingLog += `  • ${ben}\n`;
            });
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
              
              roleLineItemsService.deleteLineItemsByListingId(existingListing.id);
              
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
            
            const lineItemsToCreate = [
              ...extracted.requirements.map(text => ({
                id: randomUUID() as RoleLineItemsId,
                listingId: listingId as RoleListingId,
                description: text,
                type: 'requirement' as const,
              })),
              ...extracted.nicetohave.map(text => ({
                id: randomUUID() as RoleLineItemsId,
                listingId: listingId as RoleListingId,
                description: text,
                type: 'nicetohave' as const,
              })),
              ...extracted.responsibilities.map(text => ({
                id: randomUUID() as RoleLineItemsId,
                listingId: listingId as RoleListingId,
                description: text,
                type: 'responsibility' as const,
              })),
              ...extracted.benefits.map(text => ({
                id: randomUUID() as RoleLineItemsId,
                listingId: listingId as RoleListingId,
                description: text,
                type: 'benefit' as const,
              })),
            ];
            
            if (lineItemsToCreate.length > 0) {
              for (const item of lineItemsToCreate) {
                roleLineItemsService.createLineItem(item);
              }
              parsingLog += `[Database] Created ${extracted.requirements.length} requirements, ${extracted.nicetohave.length} nice-to-haves, ${extracted.responsibilities.length} responsibilities, and ${extracted.benefits.length} benefits\n`;
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
