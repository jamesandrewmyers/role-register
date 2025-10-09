import type { RoleQualifications } from "@/domain/entities/roleQualifications";

export interface RoleQualificationsDTO {
  id: string;
  listingId: string;
  description: string;
  type: string;
  createdAt: number;
}

export function toDTO(entity: RoleQualifications): RoleQualificationsDTO {
  return {
    id: entity.id as string,
    listingId: entity.listingId as string,
    description: entity.description,
    type: entity.type,
    createdAt: entity.createdAt,
  };
}

export function toDTOs(entities: RoleQualifications[]): RoleQualificationsDTO[] {
  return entities.map(toDTO);
}
