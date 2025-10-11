import type { eventInfo } from "@/lib/schema";
import type { EventInfo, EventInfoId } from "../entities/eventInfo";

export function toDomain(dbResult: typeof eventInfo.$inferSelect, db?: any): EventInfo {
  return {
    id: dbResult.id as EventInfoId,
    type: dbResult.type,
    payload: dbResult.payload,
    status: dbResult.status,
    createdAt: dbResult.createdAt,
    updatedAt: dbResult.updatedAt,
    error: dbResult.error,
    retries: dbResult.retries,
  };
}

export function toDomainMany(dbResults: typeof eventInfo.$inferSelect[], db?: any): EventInfo[] {
  return dbResults.map(result => toDomain(result, db));
}
