import type { RoleListing } from "@/domain/entities/roleListing";

export interface RoleListingDTO {
  id: string;
  companyId: string | null;
  title: string;
  description: string;
  location: string | null;
  workArrangement: string;
  capturedAt: number;
  dataReceivedId: string | null;
  status: string;
  appliedAt: number | null;
}

export function toDTO(entity: RoleListing): RoleListingDTO {
  return {
    id: entity.id as string,
    companyId: entity.companyId as string | null,
    title: entity.title,
    description: entity.description,
    location: entity.location as string | null,
    workArrangement: entity.workArrangement,
    capturedAt: entity.capturedAt,
    dataReceivedId: entity.dataReceivedId as string | null,
    status: entity.status,
    appliedAt: entity.appliedAt,
  };
}

export function toDTOs(entities: RoleListing[]): RoleListingDTO[] {
  return entities.map(toDTO);
}
