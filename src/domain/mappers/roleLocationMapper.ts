import { db } from "@/lib/db";
import { roleLocation, roleState } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { RoleLocation, RoleLocationId } from "../entities/roleLocation";
import * as roleStateMapper from "./roleStateMapper";

export function toDomain(dbResult: typeof roleLocation.$inferSelect): RoleLocation {
  // Fetch related state entity
  const stateRow = db
    .select()
    .from(roleState)
    .where(eq(roleState.id, dbResult.locationState))
    .get();
  
  if (!stateRow) {
    throw new Error(`RoleState not found for id: ${dbResult.locationState}`);
  }
  
  return {
    id: dbResult.id as RoleLocationId,
    state: roleStateMapper.toDomain(stateRow),
    city: dbResult.city,
    createdAt: dbResult.createdAt,
  };
}

export function toDomainMany(dbResults: typeof roleLocation.$inferSelect[]): RoleLocation[] {
  return dbResults.map(toDomain);
}

export function toPersistence(entity: RoleLocation): typeof roleLocation.$inferInsert {
  return {
    id: entity.id as string,
    locationState: entity.state.id as string,
    city: entity.city,
    createdAt: entity.createdAt,
  };
}
