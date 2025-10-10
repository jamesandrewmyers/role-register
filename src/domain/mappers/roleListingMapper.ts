import { db } from "@/lib/db";
import { roleLocation } from "@/lib/schema";
import type { roleListing } from "@/lib/schema";
import type { RoleListing, RoleListingId } from "../entities/roleListing";
import type { RoleCompanyId } from "../entities/roleCompany";
import type { DataReceivedId } from "../entities/dataReceived";
import { eq } from "drizzle-orm";
import * as roleLocationMapper from "./roleLocationMapper";

export function toDomain(dbResult: typeof roleListing.$inferSelect): RoleListing {
  // Fetch related location entity if present
  let locationEntity = null;
  if (dbResult.location) {
    const locationRow = db
      .select()
      .from(roleLocation)
      .where(eq(roleLocation.id, dbResult.location))
      .get();
    
    if (locationRow) {
      locationEntity = roleLocationMapper.toDomain(locationRow);
    }
  }
  
  return {
    id: dbResult.id as RoleListingId,
    companyId: dbResult.companyId as RoleCompanyId | null,
    title: dbResult.title,
    description: dbResult.description,
    location: locationEntity,
    workArrangement: dbResult.workArrangement,
    capturedAt: dbResult.capturedAt,
    dataReceivedId: dbResult.dataReceivedId as DataReceivedId | null,
    status: dbResult.status,
    appliedAt: dbResult.appliedAt,
  };
}

export function toDomainMany(dbResults: typeof roleListing.$inferSelect[]): RoleListing[] {
  return dbResults.map(toDomain);
}

export function toPersistence(entity: RoleListing): typeof roleListing.$inferInsert {
  return {
    id: entity.id as string,
    companyId: entity.companyId as string | null,
    title: entity.title,
    description: entity.description,
    location: entity.location ? (entity.location.id as string) : null,
    workArrangement: entity.workArrangement,
    capturedAt: entity.capturedAt,
    dataReceivedId: entity.dataReceivedId as string | null,
    status: entity.status,
    appliedAt: entity.appliedAt,
  };
}
