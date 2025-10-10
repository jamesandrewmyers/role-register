import type { RoleListing } from "@/domain/entities/roleListing";
import type { RoleLocationDTO } from "./roleLocation.dto";
import { toDTO as roleLocationToDTO } from "./roleLocation.dto";

export interface RoleListingDTO {
  id: string;
  companyId: string | null;
  title: string;
  description: string;
  location: RoleLocationDTO | null;
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
    location: entity.location ? roleLocationToDTO(entity.location) : null,
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
