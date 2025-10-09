import { db } from "@/lib/db";
import { eventInfo } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";
import * as mapper from "@/domain/mappers/eventInfoMapper";
import type { EventInfo, EventInfoId } from "@/domain/entities/eventInfo";

export interface EventInfoFilters {
  status?: string;
  type?: string;
}

export function getAllEvents(filters?: EventInfoFilters): EventInfo[] {
  const conditions = [];
  
  if (filters?.status) {
    conditions.push(eq(eventInfo.status, filters.status));
  }
  
  if (filters?.type) {
    conditions.push(eq(eventInfo.type, filters.type));
  }
  
  const results = conditions.length > 0
    ? db.select().from(eventInfo).where(and(...conditions)).orderBy(desc(eventInfo.createdAt)).all()
    : db.select().from(eventInfo).orderBy(desc(eventInfo.createdAt)).all();
    
  return mapper.toDomainMany(results);
}

export function getEventById(id: EventInfoId): EventInfo | null {
  const result = db
    .select()
    .from(eventInfo)
    .where(eq(eventInfo.id, id as string))
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

export interface CreateEventData {
  id: string;
  type: string;
  payload: string;
  status?: string;
  createdAt?: number;
  updatedAt?: number | null;
  error?: string | null;
  retries?: number;
}

export function createEvent(data: CreateEventData): EventInfo {
  const result = db
    .insert(eventInfo)
    .values({
      id: data.id,
      type: data.type,
      payload: data.payload,
      status: data.status || "pending",
      createdAt: data.createdAt || Math.floor(Date.now() / 1000),
      updatedAt: data.updatedAt || null,
      error: data.error || null,
      retries: data.retries || 0,
    })
    .returning()
    .get();
  
  return mapper.toDomain(result);
}

export function updateEventStatus(
  id: EventInfoId,
  status: string,
  error?: string | null
): EventInfo | null {
  const updateData: Partial<typeof eventInfo.$inferInsert> = {
    status,
    updatedAt: Math.floor(Date.now() / 1000),
  };
  
  if (error !== undefined) {
    updateData.error = error;
  }
  
  const result = db
    .update(eventInfo)
    .set(updateData)
    .where(eq(eventInfo.id, id as string))
    .returning()
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

export function incrementEventRetries(id: EventInfoId): EventInfo | null {
  const current = getEventById(id);
  if (!current) return null;
  
  const result = db
    .update(eventInfo)
    .set({
      retries: (current.retries || 0) + 1,
      updatedAt: Math.floor(Date.now() / 1000),
    })
    .where(eq(eventInfo.id, id as string))
    .returning()
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

export function deleteEvent(id: EventInfoId): boolean {
  const result = db
    .delete(eventInfo)
    .where(eq(eventInfo.id, id as string))
    .returning()
    .get();
  
  return !!result;
}

export function resetProcessingEvents(): void {
  db.update(eventInfo)
    .set({ status: "pending" })
    .where(eq(eventInfo.status, "processing"))
    .run();
}

export function getPendingEvents(): EventInfo[] {
  const results = db
    .select()
    .from(eventInfo)
    .where(eq(eventInfo.status, "pending"))
    .all();
  
  return mapper.toDomainMany(results);
}
