import type { RoleCompany } from "@/domain/entities/roleCompany";

export interface RoleCompanyDTO {
  id: string;
  name: string;
  website: string | null;
  createdAt: number;
}

export function toDTO(entity: RoleCompany): RoleCompanyDTO {
  return {
    id: entity.id as string,
    name: entity.name,
    website: entity.website,
    createdAt: entity.createdAt,
  };
}

export function toDTOs(entities: RoleCompany[]): RoleCompanyDTO[] {
  return entities.map(toDTO);
}
