import { db as defaultDb } from "@/lib/db";
import { roleListing } from "@/lib/schema";
import type { roleQualifications } from "@/lib/schema";
import type { RoleQualifications, RoleQualificationsId } from "../entities/roleQualifications";
import { eq } from "drizzle-orm";
import * as roleListingMapper from "./roleListingMapper";

export function toDomain(dbResult: typeof roleQualifications.$inferSelect, db = defaultDb): RoleQualifications {
  // Fetch related listing entity
  const listingRow = db
    .select()
    .from(roleListing)
    .where(eq(roleListing.id, dbResult.listingId))
    .get();
  
  if (!listingRow) {
    throw new Error(`RoleListing not found for id: ${dbResult.listingId}`);
  }
  
  return {
    id: dbResult.id as RoleQualificationsId,
    listing: roleListingMapper.toDomain(listingRow, db),
    description: dbResult.description,
    type: dbResult.type,
    createdAt: dbResult.createdAt,
  };
}

export function toDomainMany(dbResults: typeof roleQualifications.$inferSelect[], db = defaultDb): RoleQualifications[] {
  return dbResults.map(result => toDomain(result, db));
}

export function toPersistence(entity: RoleQualifications): typeof roleQualifications.$inferInsert {
  return {
    id: entity.id as string,
    listingId: entity.listing.id as string,
    description: entity.description,
    type: entity.type,
    createdAt: entity.createdAt,
  };
}
