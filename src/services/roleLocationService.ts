import { db } from "@/lib/db";
import { roleLocation } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import * as mapper from "@/domain/mappers/roleLocationMapper";
import type { RoleLocation, RoleLocationId } from "@/domain/entities/roleLocation";
import type { RoleStateId } from "@/domain/entities/roleState";

export function getAllLocations(): RoleLocation[] {
  const results = db.select().from(roleLocation).all();
  return mapper.toDomainMany(results);
}

export function getLocationById(id: RoleLocationId): RoleLocation | null {
  const result = db
    .select()
    .from(roleLocation)
    .where(eq(roleLocation.id, id as string))
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

export function getLocationByCityAndState(
  city: string,
  stateId: RoleStateId
): RoleLocation | null {
  const result = db
    .select()
    .from(roleLocation)
    .where(
      and(
        eq(roleLocation.city, city),
        eq(roleLocation.locationState, stateId as string)
      )
    )
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

export interface CreateLocationData {
  id: string;
  locationState: string;
  city: string;
  createdAt?: number;
}

export function createLocation(data: CreateLocationData): RoleLocation {
  const result = db
    .insert(roleLocation)
    .values({
      id: data.id,
      locationState: data.locationState,
      city: data.city,
      createdAt: data.createdAt || Math.floor(Date.now() / 1000),
    })
    .returning()
    .get();
  
  return mapper.toDomain(result);
}

export function getOrCreateLocation(
  city: string,
  stateId: RoleStateId,
  id?: string
): RoleLocation {
  const existing = getLocationByCityAndState(city, stateId);
  if (existing) return existing;
  
  return createLocation({
    id: id || crypto.randomUUID(),
    locationState: stateId as string,
    city,
  });
}

export function deleteLocation(id: RoleLocationId): boolean {
  const result = db
    .delete(roleLocation)
    .where(eq(roleLocation.id, id as string))
    .returning()
    .get();
  
  return !!result;
}
