import type { RoleState } from "@/domain/entities/roleState";

export interface RoleStateDTO {
  id: string;
  name: string;
  abbreviation: string;
  createdAt: number;
}

export function toDTO(entity: RoleState): RoleStateDTO {
  return {
    id: entity.id as string,
    name: entity.name,
    abbreviation: entity.abbreviation,
    createdAt: entity.createdAt,
  };
}

export function toDTOs(entities: RoleState[]): RoleStateDTO[] {
  return entities.map(toDTO);
}
