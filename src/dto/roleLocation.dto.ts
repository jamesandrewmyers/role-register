import type { RoleLocation } from "@/domain/entities/roleLocation";
import type { RoleStateDTO } from "./roleState.dto";
import { toDTO as roleStateToDTO } from "./roleState.dto";

export interface RoleLocationDTO {
  id: string;
  city: string;
  state: RoleStateDTO;
  createdAt: number;
}

export function toDTO(location: RoleLocation): RoleLocationDTO {
  return {
    id: location.id as string,
    city: location.city,
    state: roleStateToDTO(location.state),
    createdAt: location.createdAt,
  };
}

export function toDTOs(locations: RoleLocation[]): RoleLocationDTO[] {
  return locations.map(toDTO);
}
