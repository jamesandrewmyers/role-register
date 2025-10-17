import { db as defaultDb } from "@/lib/db";
import { roleListing } from "@/lib/schema";
import type { roleLineItems } from "@/lib/schema";
import type { RoleLineItems, RoleLineItemsId } from "../entities/roleLineItems";
import { eq } from "drizzle-orm";
import * as roleListingMapper from "./roleListingMapper";

export function toDomain(dbResult: typeof roleLineItems.$inferSelect, db = defaultDb): RoleLineItems {
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
    id: dbResult.id as RoleLineItemsId,
    listing: roleListingMapper.toDomain(listingRow, db),
    description: dbResult.description,
    type: dbResult.type as RoleLineItems['type'],
    createdAt: dbResult.createdAt,
  };
}

export function toDomainMany(dbResults: typeof roleLineItems.$inferSelect[], db = defaultDb): RoleLineItems[] {
  return dbResults.map(result => toDomain(result, db));
}

export function toPersistence(entity: RoleLineItems): typeof roleLineItems.$inferInsert {
  return {
    id: entity.id as string,
    listingId: entity.listing.id as string,
    description: entity.description,
    type: entity.type,
    createdAt: entity.createdAt,
  };
}
