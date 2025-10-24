import { randomUUID } from "node:crypto";
import * as cheerio from "cheerio";
import { parseHtml, parseVisualSections } from "@/lib/htmlParser";
import { extractDescriptionDetails } from "@/lib/listingDescriptionExtractor";
import { parseLinkedInJob } from "@/lib/sites/linkedIn";
import { parseIndeedJob } from "@/lib/sites/indeed";
import { runInTransaction } from "@/lib/db";
import * as dataReceivedService from "@/services/dataReceivedService";
import * as roleCompanyService from "@/services/roleCompanyService";
import * as roleListingService from "@/services/roleListingService";
import * as roleLocationService from "@/services/roleLocationService";
import * as roleStateService from "@/services/roleStateService";
import * as roleLineItemsService from "@/services/roleLineItemsService";
import type { DataReceivedId } from "@/domain/entities/dataReceived";
import type { RoleCompanyId } from "@/domain/entities/roleCompany";
import type { RoleListingId } from "@/domain/entities/roleListing";
import type { RoleLocationId } from "@/domain/entities/roleLocation";
import type { RoleLineItemsId } from "@/domain/entities/roleLineItems";

/**
 * Process HTML from a data_received record and create/update role listing.
 * This function is transaction-safe and can be called from anywhere.
 * 
 * @param dataReceivedId - The ID of the data_received record to process
 * @returns Processing log string
 * @throws Error if data record not found or processing fails
 */
export function processHtmlRecord(dataReceivedId: DataReceivedId): string {
  const dataRecord = dataReceivedService.getDataReceivedById(dataReceivedId);
  
  if (!dataRecord) {
    throw new Error(`Data record not found: ${dataReceivedId}`);
  }

  const url = new URL(dataRecord.url);
  const $ = cheerio.load(dataRecord.html);
  
  let parsingLog = `[Parser] Processing ${dataRecord.url}\n`;

  runInTransaction(() => {
    if (url.hostname === "www.linkedin.com") {
      parsingLog += processLinkedInJob($, dataReceivedId, parsingLog);
    } else if (url.hostname === "www.indeed.com") {
      parsingLog += processIndeedJob($, dataReceivedId, parsingLog);
    } else {
      parsingLog += `[Parser] No parser configured for hostname: ${url.hostname}\n`;
    }

    // Store parsing log in processing notes
    dataReceivedService.updateDataReceived(dataReceivedId, {
      processingNotes: parsingLog,
      processed: "true",
    });
  });

  return parsingLog;
}

function processLinkedInJob($: cheerio.CheerioAPI, dataReceivedId: DataReceivedId, initialLog: string): string {
  let log = "[LinkedIn Parser] Parsing job posting...\n";

  const { workArrangement, jobTitle, companyName, jobLocation: jobLocationRaw, jobDescription } = parseLinkedInJob($);

  log += `[LinkedIn Parser] Work Arrangement: ${workArrangement}\n`;
  log += `[LinkedIn Parser] Job Title: ${jobTitle}\n`;
  log += `[LinkedIn Parser] Company Name: ${companyName}\n`;
  log += `[LinkedIn Parser] Job Location: ${jobLocationRaw}\n`;

  if (jobDescription) {
    const nodes = parseHtml("<div>"+jobDescription+"</div>");
    const sections = nodes.length > 0 ? parseVisualSections(nodes[0]) : [];
    const extracted = extractDescriptionDetails(sections);
    
    const totalItems = extracted.requirements.length + extracted.nicetohave.length + extracted.responsibilities.length + extracted.benefits.length;
    log += `\n[Description Extractor] Extracted ${totalItems} items from ${sections.length} sections\n`;
    
    if (extracted.requirements.length > 0) {
      log += `\nRequirements (${extracted.requirements.length}):\n`;
    }
    
    if (extracted.nicetohave.length > 0) {
      log += `\nNice to Have (${extracted.nicetohave.length}):\n`;
    }
    
    if (extracted.responsibilities.length > 0) {
      log += `\nResponsibilities (${extracted.responsibilities.length}):\n`;
    }
    
    if (extracted.benefits.length > 0) {
      log += `\nBenefits (${extracted.benefits.length}):\n`;
    }
    
    if (jobTitle && companyName && jobDescription) {
      log += createOrUpdateRoleListing({
        dataReceivedId,
        jobTitle,
        companyName,
        jobDescription,
        jobLocationRaw,
        workArrangement,
        extracted
      });
    }
  }

  return log;
}

function processIndeedJob($: cheerio.CheerioAPI, dataReceivedId: DataReceivedId, initialLog: string): string {
  let log = "[Indeed Parser] Parsing job posting...\n";

  const { workArrangement, jobTitle, companyName, jobLocation: jobLocationRaw, jobDescription } = parseIndeedJob($);

  log += `[Indeed Parser] Work Arrangement: ${workArrangement}\n`;
  log += `[Indeed Parser] Job Title: ${jobTitle}\n`;
  log += `[Indeed Parser] Company Name: ${companyName}\n`;
  log += `[Indeed Parser] Job Location: ${jobLocationRaw}\n`;

  if (jobDescription) {
    const nodes = parseHtml("<div>" + jobDescription + "</div>");
    const sections = nodes.length > 0 ? parseVisualSections(nodes[0]) : [];
    const extracted = extractDescriptionDetails(sections);
    
    const totalItems = extracted.requirements.length + extracted.nicetohave.length + extracted.responsibilities.length + extracted.benefits.length;
    log += `\n[Description Extractor] Extracted ${totalItems} items from ${sections.length} sections\n`;
    
    if (extracted.requirements.length > 0) {
      log += `\nRequirements (${extracted.requirements.length}):\n`;
    }
    
    if (extracted.nicetohave.length > 0) {
      log += `\nNice to Have (${extracted.nicetohave.length}):\n`;
    }
    
    if (extracted.responsibilities.length > 0) {
      log += `\nResponsibilities (${extracted.responsibilities.length}):\n`;
    }
    
    if (extracted.benefits.length > 0) {
      log += `\nBenefits (${extracted.benefits.length}):\n`;
    }
    
    if (jobTitle && companyName && jobDescription) {
      log += createOrUpdateRoleListing({
        dataReceivedId,
        jobTitle,
        companyName,
        jobDescription,
        jobLocationRaw,
        workArrangement,
        extracted
      });
    }
  }

  return log;
}

interface CreateOrUpdateListingParams {
  dataReceivedId: DataReceivedId;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  jobLocationRaw: string;
  workArrangement: string;
  extracted: {
    requirements: string[];
    nicetohave: string[];
    responsibilities: string[];
    benefits: string[];
  };
}

function createOrUpdateRoleListing(params: CreateOrUpdateListingParams): string {
  const { dataReceivedId, jobTitle, companyName, jobDescription, jobLocationRaw, workArrangement, extracted } = params;
  let log = "";

  let companyId = roleCompanyService.getCompanyByName(companyName)?.id;
  
  if (!companyId) {
    companyId = randomUUID() as RoleCompanyId;
    roleCompanyService.createCompany({
      id: companyId,
      name: companyName,
      website: null,
    });
    log += `[Database] Created company: ${companyName}\n`;
  }
  
  let locationId: string | undefined;
  if (jobLocationRaw) {
    const locationParts = jobLocationRaw.split(',').map(p => p.trim());
    const city = locationParts[0] || '';
    const stateStr = locationParts[1] || '';
    
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
        log += `[Database] Created location: ${city}, ${stateStr}\n`;
      }
    } else {
      log += `[Database] State not found: ${stateStr}\n`;
    }
  }
  
  const existingListing = roleListingService.getListingByDataReceivedId(dataReceivedId);
  
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
    
    log += `[Database] Updated existing role listing: ${jobTitle}\n`;
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
      dataReceivedId: dataReceivedId,
      status: "new",
      appliedAt: null,
    });
    log += `[Database] Created role listing: ${jobTitle}\n`;
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
    log += `[Database] Created ${extracted.requirements.length} requirements, ${extracted.nicetohave.length} nice-to-haves, ${extracted.responsibilities.length} responsibilities, and ${extracted.benefits.length} benefits\n`;
  }

  return log;
}
