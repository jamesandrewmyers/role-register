import type { roleQualifications } from "@/lib/schema";
import type { RoleQualifications, RoleQualificationsId } from "../entities/roleQualifications";
import type { RoleListingId } from "../entities/roleListing";

export function toDomain(dbResult: typeof roleQualifications.$inferSelect): RoleQualifications {
  return {
    id: dbResult.id as RoleQualificationsId,
    listingId: dbResult.listingId as RoleListingId,
    description: dbResult.description,
    type: dbResult.type,
    createdAt: dbResult.createdAt,
  };
}

export function toDomainMany(dbResults: typeof roleQualifications.$inferSelect[]): RoleQualifications[] {
  return dbResults.map(toDomain);
}
