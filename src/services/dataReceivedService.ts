import { db } from "@/lib/db";
import { dataReceived } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import * as mapper from "@/domain/mappers/dataReceivedMapper";
import type { DataReceived, DataReceivedId } from "@/domain/entities/dataReceived";

export function getAllDataReceived(): DataReceived[] {
  const results = db
    .select()
    .from(dataReceived)
    .orderBy(desc(dataReceived.receivedAt))
    .all();
  
  return mapper.toDomainMany(results);
}

export function getDataReceivedById(id: DataReceivedId): DataReceived | null {
  const result = db
    .select()
    .from(dataReceived)
    .where(eq(dataReceived.id, id as string))
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

export interface CreateDataReceivedData {
  id: string;
  url: string;
  title: string;
  html: string;
  text: string;
  receivedAt?: number;
  processed?: string;
  processingNotes?: string;
}

export function createDataReceived(data: CreateDataReceivedData): DataReceived {
  const result = db
    .insert(dataReceived)
    .values({
      id: data.id,
      url: data.url,
      title: data.title,
      html: data.html,
      text: data.text,
      receivedAt: data.receivedAt || Math.floor(Date.now() / 1000),
      processed: data.processed || "false",
      processingNotes: data.processingNotes || null,
    })
    .returning()
    .get();
  
  return mapper.toDomain(result);
}

export function updateDataReceivedProcessing(
  id: DataReceivedId,
  processed: string,
  processingNotes?: string | null
): DataReceived | null {
  const result = db
    .update(dataReceived)
    .set({
      processed,
      processingNotes: processingNotes !== undefined ? processingNotes : undefined,
    })
    .where(eq(dataReceived.id, id as string))
    .returning()
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

export function updateDataReceived(
  id: DataReceivedId,
  data: Partial<{ processed: string; processingNotes: string | null }>
): DataReceived | null {
  const result = db
    .update(dataReceived)
    .set(data)
    .where(eq(dataReceived.id, id as string))
    .returning()
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

export function deleteDataReceived(id: DataReceivedId): boolean {
  const result = db
    .delete(dataReceived)
    .where(eq(dataReceived.id, id as string))
    .returning()
    .get();
  
  return !!result;
}
