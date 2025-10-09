import type { RoleLocation } from "@/domain/entities/roleLocation";

export interface RoleLocationDTO {
  id: string;
  locationState: string;
  city: string;
  createdAt: number;
}

export function toDTO(entity: RoleLocation): RoleLocationDTO {
  return {
    id: entity.id as string,
    locationState: entity.locationState as string,
    city: entity.city,
    createdAt: entity.createdAt,
  };
}

export function toDTOs(entities: RoleLocation[]): RoleLocationDTO[] {
  return entities.map(toDTO);
}
