import type { roleAttachment } from "@/lib/schema";
import type { RoleAttachment, RoleAttachmentId } from "../entities/roleAttachment";
import type { RoleListingId } from "../entities/roleListing";

export function toDomain(dbResult: typeof roleAttachment.$inferSelect): RoleAttachment {
  return {
    id: dbResult.id as RoleAttachmentId,
    listingId: dbResult.listingId as RoleListingId,
    type: dbResult.type,
    pathOrUrl: dbResult.pathOrUrl,
    createdAt: dbResult.createdAt,
  };
}

export function toDomainMany(dbResults: typeof roleAttachment.$inferSelect[]): RoleAttachment[] {
  return dbResults.map(toDomain);
}
