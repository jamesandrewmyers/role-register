import type { valueMapping } from "@/lib/schema";
import type { ValueMapping, ValueMappingId } from "../entities/valueMapping";

export function toDomain(
  dbResult: typeof valueMapping.$inferSelect,
  db?: any
): ValueMapping {
  return {
    id: dbResult.id as ValueMappingId,
    valueName: dbResult.valueName,
    valueSource: dbResult.valueSource,
    valueType: dbResult.valueType,
    valueEntity: dbResult.valueEntity,
    createdAt: dbResult.createdAt,
  };
}

export function toDomainMany(
  dbResults: typeof valueMapping.$inferSelect[],
  db?: any
): ValueMapping[] {
  return dbResults.map((result) => toDomain(result, db));
}
