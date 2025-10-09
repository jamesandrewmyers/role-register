import { db } from "@/lib/db";
import { roleEvent } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import * as mapper from "@/domain/mappers/roleEventMapper";
import type { RoleEvent, RoleEventId } from "@/domain/entities/roleEvent";
import type { RoleListingId } from "@/domain/entities/roleListing";

export function getEventsByListingId(listingId: RoleListingId): RoleEvent[] {
  const results = db
    .select()
    .from(roleEvent)
    .where(eq(roleEvent.eventListingId, listingId as string))
    .orderBy(desc(roleEvent.eventDate))
    .all();
  
  return mapper.toDomainMany(results);
}

export function getEventById(id: RoleEventId): RoleEvent | null {
  const result = db
    .select()
    .from(roleEvent)
    .where(eq(roleEvent.id, id as string))
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

export interface CreateRoleEventData {
  id: string;
  eventListingId: string;
  eventType: string;
  eventTitle: string;
  eventDate?: number | null;
  eventNotes?: string | null;
}

export function createRoleEvent(data: CreateRoleEventData): RoleEvent {
  const result = db
    .insert(roleEvent)
    .values({
      id: data.id,
      eventListingId: data.eventListingId,
      eventType: data.eventType,
      eventTitle: data.eventTitle,
      eventDate: data.eventDate || null,
      eventNotes: data.eventNotes || null,
    })
    .returning()
    .get();
  
  return mapper.toDomain(result);
}

export interface UpdateRoleEventData {
  eventType?: string;
  eventTitle?: string;
  eventDate?: number | null;
  eventNotes?: string | null;
}

export function updateRoleEvent(id: RoleEventId, data: UpdateRoleEventData): RoleEvent | null {
  const result = db
    .update(roleEvent)
    .set(data)
    .where(eq(roleEvent.id, id as string))
    .returning()
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

export function deleteRoleEvent(id: RoleEventId): boolean {
  const result = db
    .delete(roleEvent)
    .where(eq(roleEvent.id, id as string))
    .returning()
    .get();
  
  return !!result;
}
