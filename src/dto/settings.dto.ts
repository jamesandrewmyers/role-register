import type { Settings } from "@/domain/entities/settings";

export interface SettingsDTO {
  id: string;
  name: string;
  value: string;
  updatedAt: number;
}

export function toDTO(entity: Settings): SettingsDTO {
  return {
    id: entity.id as string,
    name: entity.name,
    value: entity.value,
    updatedAt: entity.updatedAt,
  };
}

export function toDTOs(entities: Settings[]): SettingsDTO[] {
  return entities.map(toDTO);
}
