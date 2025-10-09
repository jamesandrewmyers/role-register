import type { roleCallout } from "@/lib/schema";
import type { RoleCallout, RoleCalloutId } from "../entities/roleCallout";
import type { RoleListingId } from "../entities/roleListing";

export function toDomain(dbResult: typeof roleCallout.$inferSelect): RoleCallout {
  return {
    id: dbResult.id as RoleCalloutId,
    listingId: dbResult.listingId as RoleListingId,
    content: dbResult.content,
  };
}

export function toDomainMany(dbResults: typeof roleCallout.$inferSelect[]): RoleCallout[] {
  return dbResults.map(toDomain);
}
