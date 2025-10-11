import type { settings } from "@/lib/schema";
import type { Settings, SettingsId } from "../entities/settings";

export function toDomain(dbResult: typeof settings.$inferSelect, db?: any): Settings {
  return {
    id: dbResult.id as SettingsId,
    name: dbResult.name,
    value: dbResult.value,
    updatedAt: dbResult.updatedAt,
  };
}

export function toDomainMany(dbResults: typeof settings.$inferSelect[], db?: any): Settings[] {
  return dbResults.map(result => toDomain(result, db));
}
