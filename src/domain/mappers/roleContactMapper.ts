import { db } from "@/lib/db";
import { roleListing } from "@/lib/schema";
import type { roleContact } from "@/lib/schema";
import type { RoleContact, RoleContactId } from "../entities/roleContact";
import { eq } from "drizzle-orm";
import * as roleListingMapper from "./roleListingMapper";

export function toDomain(dbResult: typeof roleContact.$inferSelect): RoleContact {
  const listingRow = db
    .select()
    .from(roleListing)
    .where(eq(roleListing.id, dbResult.listingId))
    .get();
  
  if (!listingRow) {
    throw new Error(`RoleListing not found for id: ${dbResult.listingId}`);
  }
  
  return {
    id: dbResult.id as RoleContactId,
    listing: roleListingMapper.toDomain(listingRow),
    name: dbResult.name,
    email: dbResult.email,
    phone: dbResult.phone,
  };
}

export function toDomainMany(dbResults: typeof roleContact.$inferSelect[]): RoleContact[] {
  return dbResults.map(toDomain);
}

export function toPersistence(entity: RoleContact): typeof roleContact.$inferInsert {
  return {
    id: entity.id as string,
    listingId: entity.listing.id as string,
    name: entity.name,
    email: entity.email,
    phone: entity.phone,
  };
}
