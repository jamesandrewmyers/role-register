import { db } from "@/lib/db";
import { roleListing } from "@/lib/schema";
import type { roleQualifications } from "@/lib/schema";
import type { RoleQualifications, RoleQualificationsId } from "../entities/roleQualifications";
import { eq } from "drizzle-orm";
import * as roleListingMapper from "./roleListingMapper";

export function toDomain(dbResult: typeof roleQualifications.$inferSelect): RoleQualifications {
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
    listing: roleListingMapper.toDomain(listingRow),
    description: dbResult.description,
    type: dbResult.type,
    createdAt: dbResult.createdAt,
  };
}

export function toDomainMany(dbResults: typeof roleQualifications.$inferSelect[]): RoleQualifications[] {
  return dbResults.map(toDomain);
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
