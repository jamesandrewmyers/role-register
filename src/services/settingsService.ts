import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import * as mapper from "@/domain/mappers/settingsMapper";
import type { Settings, SettingsId } from "@/domain/entities/settings";

export function getAllSettings(): Settings[] {
  const results = db.select().from(settings).all();
  return mapper.toDomainMany(results);
}

export function getSettingByName(name: string): Settings | null {
  const result = db
    .select()
    .from(settings)
    .where(eq(settings.name, name))
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

export function getSettingById(id: SettingsId): Settings | null {
  const result = db
    .select()
    .from(settings)
    .where(eq(settings.id, id as string))
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

export function updateOrCreateSetting(name: string, value: string, id?: string): Settings {
  const existing = getSettingByName(name);
  
  if (existing) {
    const result = db
      .update(settings)
      .set({
        value,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(settings.name, name))
      .returning()
      .get();
    
    return mapper.toDomain(result);
  }
  
  const result = db
    .insert(settings)
    .values({
      id: id || crypto.randomUUID(),
      name,
      value,
      updatedAt: Math.floor(Date.now() / 1000),
    })
    .returning()
    .get();
  
  return mapper.toDomain(result);
}

export interface CreateSettingData {
  id: string;
  name: string;
  value: string;
  updatedAt: number;
}

export function createSetting(data: CreateSettingData): Settings {
  const result = db
    .insert(settings)
    .values(data)
    .returning()
    .get();
  
  return mapper.toDomain(result);
}

export interface UpdateSettingData {
  value?: string;
  updatedAt?: number;
}

export function updateSetting(id: SettingsId, data: UpdateSettingData): Settings | null {
  const updateData = {
    ...data,
    updatedAt: data.updatedAt || Math.floor(Date.now() / 1000),
  };
  
  const result = db
    .update(settings)
    .set(updateData)
    .where(eq(settings.id, id as string))
    .returning()
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

export function deleteSetting(id: SettingsId): boolean {
  const result = db
    .delete(settings)
    .where(eq(settings.id, id as string))
    .returning()
    .get();
  
  return !!result;
}
