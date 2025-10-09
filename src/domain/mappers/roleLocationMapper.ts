import type { roleLocation } from "@/lib/schema";
import type { RoleLocation, RoleLocationId } from "../entities/roleLocation";
import type { RoleStateId } from "../entities/roleState";

export function toDomain(dbResult: typeof roleLocation.$inferSelect): RoleLocation {
  return {
    id: dbResult.id as RoleLocationId,
    locationState: dbResult.locationState as RoleStateId,
    city: dbResult.city,
    createdAt: dbResult.createdAt,
  };
}

export function toDomainMany(dbResults: typeof roleLocation.$inferSelect[]): RoleLocation[] {
  return dbResults.map(toDomain);
}
