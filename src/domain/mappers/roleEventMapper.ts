import { db as defaultDb } from "@/lib/db";
import { roleListing } from "@/lib/schema";
import type { roleEvent } from "@/lib/schema";
import type { RoleEvent, RoleEventId } from "../entities/roleEvent";
import { eq } from "drizzle-orm";
import * as roleListingMapper from "./roleListingMapper";

export function toDomain(dbResult: typeof roleEvent.$inferSelect, db = defaultDb): RoleEvent {
  // Fetch related listing entity
  const listingRow = db
    .select()
    .from(roleListing)
    .where(eq(roleListing.id, dbResult.eventListingId))
    .get();
  
  if (!listingRow) {
    throw new Error(`RoleListing not found for id: ${dbResult.eventListingId}`);
  }
  
  return {
    id: dbResult.id as RoleEventId,
    listing: roleListingMapper.toDomain(listingRow, db),
    eventType: dbResult.eventType,
    eventTitle: dbResult.eventTitle,
    eventDate: dbResult.eventDate,
    eventNotes: dbResult.eventNotes,
  };
}

export function toDomainMany(dbResults: typeof roleEvent.$inferSelect[], db = defaultDb): RoleEvent[] {
  return dbResults.map(result => toDomain(result, db));
}

export function toPersistence(entity: RoleEvent): typeof roleEvent.$inferInsert {
  return {
    id: entity.id as string,
    eventListingId: entity.listing.id as string,
    eventType: entity.eventType,
    eventTitle: entity.eventTitle,
    eventDate: entity.eventDate,
    eventNotes: entity.eventNotes,
  };
}
