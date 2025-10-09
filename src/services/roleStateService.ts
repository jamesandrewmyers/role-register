import { db } from "@/lib/db";
import { roleState } from "@/lib/schema";
import { eq } from "drizzle-orm";
import * as mapper from "@/domain/mappers/roleStateMapper";
import type { RoleState, RoleStateId } from "@/domain/entities/roleState";

export function getAllStates(): RoleState[] {
  const results = db.select().from(roleState).all();
  return mapper.toDomainMany(results);
}

export function getStateById(id: RoleStateId): RoleState | null {
  const result = db
    .select()
    .from(roleState)
    .where(eq(roleState.id, id as string))
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

export function getStateByAbbreviation(abbreviation: string): RoleState | null {
  const result = db
    .select()
    .from(roleState)
    .where(eq(roleState.abbreviation, abbreviation))
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

export function getStateByName(name: string): RoleState | null {
  const result = db
    .select()
    .from(roleState)
    .where(eq(roleState.name, name))
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

export interface CreateStateData {
  id: string;
  name: string;
  abbreviation: string;
  createdAt?: number;
}

export function createState(data: CreateStateData): RoleState {
  const result = db
    .insert(roleState)
    .values({
      id: data.id,
      name: data.name,
      abbreviation: data.abbreviation,
      createdAt: data.createdAt || Math.floor(Date.now() / 1000),
    })
    .returning()
    .get();
  
  return mapper.toDomain(result);
}

export function deleteState(id: RoleStateId): boolean {
  const result = db
    .delete(roleState)
    .where(eq(roleState.id, id as string))
    .returning()
    .get();
  
  return !!result;
}
