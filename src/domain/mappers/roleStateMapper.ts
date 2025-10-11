import type { roleState } from "@/lib/schema";
import type { RoleState, RoleStateId } from "../entities/roleState";

export function toDomain(dbResult: typeof roleState.$inferSelect, db?: any): RoleState {
  return {
    id: dbResult.id as RoleStateId,
    name: dbResult.name,
    abbreviation: dbResult.abbreviation,
    createdAt: dbResult.createdAt,
  };
}

export function toDomainMany(dbResults: typeof roleState.$inferSelect[], db?: any): RoleState[] {
  return dbResults.map(result => toDomain(result, db));
}
