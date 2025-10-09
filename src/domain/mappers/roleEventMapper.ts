import type { roleEvent } from "@/lib/schema";
import type { RoleEvent, RoleEventId } from "../entities/roleEvent";
import type { RoleListingId } from "../entities/roleListing";

export function toDomain(dbResult: typeof roleEvent.$inferSelect): RoleEvent {
  return {
    id: dbResult.id as RoleEventId,
    eventListingId: dbResult.eventListingId as RoleListingId,
    eventType: dbResult.eventType,
    eventTitle: dbResult.eventTitle,
    eventDate: dbResult.eventDate,
    eventNotes: dbResult.eventNotes,
  };
}

export function toDomainMany(dbResults: typeof roleEvent.$inferSelect[]): RoleEvent[] {
  return dbResults.map(toDomain);
}
