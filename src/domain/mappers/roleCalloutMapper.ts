import { db } from "@/lib/db";
import { roleListing } from "@/lib/schema";
import type { roleCallout } from "@/lib/schema";
import type { RoleCallout, RoleCalloutId } from "../entities/roleCallout";
import { eq } from "drizzle-orm";
import * as roleListingMapper from "./roleListingMapper";

export function toDomain(dbResult: typeof roleCallout.$inferSelect): RoleCallout {
  const listingRow = db
    .select()
    .from(roleListing)
    .where(eq(roleListing.id, dbResult.listingId))
    .get();
  
  if (!listingRow) {
    throw new Error(`RoleListing not found for id: ${dbResult.listingId}`);
  }
  
  return {
    id: dbResult.id as RoleCalloutId,
    listing: roleListingMapper.toDomain(listingRow),
    content: dbResult.content,
  };
}

export function toDomainMany(dbResults: typeof roleCallout.$inferSelect[]): RoleCallout[] {
  return dbResults.map(toDomain);
}

export function toPersistence(entity: RoleCallout): typeof roleCallout.$inferInsert {
  return {
    id: entity.id as string,
    listingId: entity.listing.id as string,
    content: entity.content,
  };
}
