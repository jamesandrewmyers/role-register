import type { dataReceived } from "@/lib/schema";
import type { DataReceived, DataReceivedId } from "../entities/dataReceived";

export function toDomain(dbResult: typeof dataReceived.$inferSelect, db?: any): DataReceived {
  return {
    id: dbResult.id as DataReceivedId,
    url: dbResult.url,
    title: dbResult.title,
    html: dbResult.html,
    text: dbResult.text,
    receivedAt: dbResult.receivedAt,
    processed: dbResult.processed,
    processingNotes: dbResult.processingNotes,
  };
}

export function toDomainMany(dbResults: typeof dataReceived.$inferSelect[], db?: any): DataReceived[] {
  return dbResults.map(result => toDomain(result, db));
}
