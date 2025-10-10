import { db } from "@/lib/db";
import { roleListing } from "@/lib/schema";
import type { roleAttachment } from "@/lib/schema";
import type { RoleAttachment, RoleAttachmentId } from "../entities/roleAttachment";
import { eq } from "drizzle-orm";
import * as roleListingMapper from "./roleListingMapper";

export function toDomain(dbResult: typeof roleAttachment.$inferSelect): RoleAttachment {
  const listingRow = db
    .select()
    .from(roleListing)
    .where(eq(roleListing.id, dbResult.listingId))
    .get();
  
  if (!listingRow) {
    throw new Error(`RoleListing not found for id: ${dbResult.listingId}`);
  }
  
  return {
    id: dbResult.id as RoleAttachmentId,
    listing: roleListingMapper.toDomain(listingRow),
    type: dbResult.type,
    pathOrUrl: dbResult.pathOrUrl,
    createdAt: dbResult.createdAt,
  };
}

export function toDomainMany(dbResults: typeof roleAttachment.$inferSelect[]): RoleAttachment[] {
  return dbResults.map(toDomain);
}

export function toPersistence(entity: RoleAttachment): typeof roleAttachment.$inferInsert {
  return {
    id: entity.id as string,
    listingId: entity.listing.id as string,
    type: entity.type,
    pathOrUrl: entity.pathOrUrl,
    createdAt: entity.createdAt,
  };
}
