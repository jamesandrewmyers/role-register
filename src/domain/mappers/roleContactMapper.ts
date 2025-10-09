import type { roleContact } from "@/lib/schema";
import type { RoleContact, RoleContactId } from "../entities/roleContact";
import type { RoleListingId } from "../entities/roleListing";

export function toDomain(dbResult: typeof roleContact.$inferSelect): RoleContact {
  return {
    id: dbResult.id as RoleContactId,
    listingId: dbResult.listingId as RoleListingId,
    name: dbResult.name,
    email: dbResult.email,
    phone: dbResult.phone,
  };
}

export function toDomainMany(dbResults: typeof roleContact.$inferSelect[]): RoleContact[] {
  return dbResults.map(toDomain);
}
