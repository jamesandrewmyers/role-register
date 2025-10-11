import { db as defaultDb } from "@/lib/db";
import { roleLocation, roleCompany, dataReceived } from "@/lib/schema";
import type { roleListing } from "@/lib/schema";
import type { RoleListing, RoleListingId } from "../entities/roleListing";
import { eq } from "drizzle-orm";
import * as roleLocationMapper from "./roleLocationMapper";
import * as roleCompanyMapper from "./roleCompanyMapper";
import * as dataReceivedMapper from "./dataReceivedMapper";

export function toDomain(dbResult: typeof roleListing.$inferSelect, db = defaultDb): RoleListing {
  // Fetch related company entity if present
  let companyEntity = null;
  if (dbResult.companyId) {
    const companyRow = db
      .select()
      .from(roleCompany)
      .where(eq(roleCompany.id, dbResult.companyId))
      .get();
    
    if (companyRow) {
      companyEntity = roleCompanyMapper.toDomain(companyRow, db);
    }
  }
  
  // Fetch related location entity if present
  let locationEntity = null;
  if (dbResult.location) {
    const locationRow = db
      .select()
      .from(roleLocation)
      .where(eq(roleLocation.id, dbResult.location))
      .get();
    
    if (locationRow) {
      locationEntity = roleLocationMapper.toDomain(locationRow, db);
    }
  }
  
  // Fetch related dataReceived entity if present
  let dataReceivedEntity = null;
  if (dbResult.dataReceivedId) {
    const dataReceivedRow = db
      .select()
      .from(dataReceived)
      .where(eq(dataReceived.id, dbResult.dataReceivedId))
      .get();
    
    if (dataReceivedRow) {
      dataReceivedEntity = dataReceivedMapper.toDomain(dataReceivedRow, db);
    }
  }
  
  return {
    id: dbResult.id as RoleListingId,
    company: companyEntity,
    title: dbResult.title,
    description: dbResult.description,
    location: locationEntity,
    workArrangement: dbResult.workArrangement,
    capturedAt: dbResult.capturedAt,
    dataReceived: dataReceivedEntity,
    status: dbResult.status,
    appliedAt: dbResult.appliedAt,
  };
}

export function toDomainMany(dbResults: typeof roleListing.$inferSelect[], db = defaultDb): RoleListing[] {
  return dbResults.map(result => toDomain(result, db));
}

export function toPersistence(entity: RoleListing): typeof roleListing.$inferInsert {
  return {
    id: entity.id as string,
    companyId: entity.company ? (entity.company.id as string) : null,
    title: entity.title,
    description: entity.description,
    location: entity.location ? (entity.location.id as string) : null,
    workArrangement: entity.workArrangement,
    capturedAt: entity.capturedAt,
    dataReceivedId: entity.dataReceived ? (entity.dataReceived.id as string) : null,
    status: entity.status,
    appliedAt: entity.appliedAt,
  };
}
