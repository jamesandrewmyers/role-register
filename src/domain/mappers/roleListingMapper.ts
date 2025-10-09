import type { roleListing } from "@/lib/schema";
import type { RoleListing, RoleListingId } from "../entities/roleListing";
import type { RoleCompanyId } from "../entities/roleCompany";
import type { RoleLocationId } from "../entities/roleLocation";
import type { DataReceivedId } from "../entities/dataReceived";

export function toDomain(dbResult: typeof roleListing.$inferSelect): RoleListing {
  return {
    id: dbResult.id as RoleListingId,
    companyId: dbResult.companyId as RoleCompanyId | null,
    title: dbResult.title,
    description: dbResult.description,
    location: dbResult.location as RoleLocationId | null,
    workArrangement: dbResult.workArrangement,
    capturedAt: dbResult.capturedAt,
    dataReceivedId: dbResult.dataReceivedId as DataReceivedId | null,
    status: dbResult.status,
    appliedAt: dbResult.appliedAt,
  };
}

export function toDomainMany(dbResults: typeof roleListing.$inferSelect[]): RoleListing[] {
  return dbResults.map(toDomain);
}
