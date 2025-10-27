import type { valueMapping } from "@/lib/schema";
import type { ValueMapping, ValueMappingId } from "../entities/valueMapping";

export function toDomain(
  dbResult: typeof valueMapping.$inferSelect,
  db?: any
): ValueMapping {
  return {
    id: dbResult.id as ValueMappingId,
    valueSite: dbResult.valueSite,
    valueEntity: dbResult.valueEntity,
    valueEntityProperty: dbResult.valueEntityProperty,
    cssSelector: dbResult.cssSelector,
    selectorOrder: dbResult.selectorOrder,
    selectorDescription: dbResult.selectorDescription || undefined,
    createdAt: dbResult.createdAt,
    updatedAt: dbResult.updatedAt || undefined,
  };
}

export function toDomainMany(
  dbResults: typeof valueMapping.$inferSelect[],
  db?: any
): ValueMapping[] {
  return dbResults.map((result) => toDomain(result, db));
}
