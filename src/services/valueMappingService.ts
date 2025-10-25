import { db } from "@/lib/db";
import { valueMapping } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import * as mapper from "@/domain/mappers/valueMappingMapper";
import type { ValueMapping, ValueMappingId } from "@/domain/entities/valueMapping";

export function getAllValueMappings(): ValueMapping[] {
  const results = db.select().from(valueMapping).all();
  return mapper.toDomainMany(results);
}

export function getValueMappingById(id: ValueMappingId): ValueMapping | null {
  const result = db
    .select()
    .from(valueMapping)
    .where(eq(valueMapping.id, id as string))
    .get();

  return result ? mapper.toDomain(result) : null;
}

/**
 * Get value mappings by name (multiple mappings can exist for a value_name)
 */
export function getValueMappingsByName(valueName: string): ValueMapping[] {
  const results = db
    .select()
    .from(valueMapping)
    .where(eq(valueMapping.valueName, valueName))
    .all();

  return mapper.toDomainMany(results);
}

/**
 * Get value mappings by entity type
 */
export function getValueMappingsByEntity(valueEntity: string): ValueMapping[] {
  const results = db
    .select()
    .from(valueMapping)
    .where(eq(valueMapping.valueEntity, valueEntity))
    .all();

  return mapper.toDomainMany(results);
}

/**
 * Get value mappings by source (e.g., linkedin, indeed)
 */
export function getValueMappingsBySource(valueSource: string): ValueMapping[] {
  const results = db
    .select()
    .from(valueMapping)
    .where(eq(valueMapping.valueSource, valueSource))
    .all();

  return mapper.toDomainMany(results);
}

/**
 * Get a specific value mapping by name and source
 */
export function getValueMappingByNameAndSource(
  valueName: string,
  valueSource: string
): ValueMapping | null {
  const result = db
    .select()
    .from(valueMapping)
    .where(
      and(
        eq(valueMapping.valueName, valueName),
        eq(valueMapping.valueSource, valueSource)
      )
    )
    .get();

  return result ? mapper.toDomain(result) : null;
}

/**
 * Get value mappings by name, source, and entity
 */
export function getValueMappingsByNameSourceAndEntity(
  valueName: string,
  valueSource: string,
  valueEntity: string
): ValueMapping[] {
  const results = db
    .select()
    .from(valueMapping)
    .where(
      and(
        eq(valueMapping.valueName, valueName),
        eq(valueMapping.valueSource, valueSource),
        eq(valueMapping.valueEntity, valueEntity)
      )
    )
    .all();

  return mapper.toDomainMany(results);
}

export interface CreateValueMappingData {
  id: string;
  valueName: string;
  valueSource: string;
  valueType: string;
  valueEntity: string;
  createdAt: number;
}

export function createValueMapping(data: CreateValueMappingData): ValueMapping {
  const result = db
    .insert(valueMapping)
    .values(data)
    .returning()
    .get();

  return mapper.toDomain(result);
}

export interface UpdateValueMappingData {
  valueName?: string;
  valueSource?: string;
  valueType?: string;
  valueEntity?: string;
}

export function updateValueMapping(
  id: ValueMappingId,
  data: UpdateValueMappingData
): ValueMapping | null {
  const result = db
    .update(valueMapping)
    .set(data)
    .where(eq(valueMapping.id, id as string))
    .returning()
    .get();

  return result ? mapper.toDomain(result) : null;
}

export function deleteValueMapping(id: ValueMappingId): boolean {
  const result = db
    .delete(valueMapping)
    .where(eq(valueMapping.id, id as string))
    .returning()
    .get();

  return !!result;
}

/**
 * Delete value mappings by name
 */
export function deleteValueMappingsByName(valueName: string): boolean {
  const result = db
    .delete(valueMapping)
    .where(eq(valueMapping.valueName, valueName))
    .returning()
    .all();

  return result.length > 0;
}

/**
 * Delete value mappings by source
 */
export function deleteValueMappingsBySource(valueSource: string): boolean {
  const result = db
    .delete(valueMapping)
    .where(eq(valueMapping.valueSource, valueSource))
    .returning()
    .all();

  return result.length > 0;
}

/**
 * Delete value mappings by entity
 */
export function deleteValueMappingsByEntity(valueEntity: string): boolean {
  const result = db
    .delete(valueMapping)
    .where(eq(valueMapping.valueEntity, valueEntity))
    .returning()
    .all();

  return result.length > 0;
}
