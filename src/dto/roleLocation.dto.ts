import type { RoleLocation } from "@/domain/entities/roleLocation";
import type { RoleState } from "@/domain/entities/roleState";
import type { RoleStateDTO } from "./roleState.dto";
import { toDTO as roleStateToDTO } from "./roleState.dto";

export interface RoleLocationDTO {
  id: string;
  city: string;
  locationState: RoleStateDTO;
  createdAt: number;
}

export function toDTO(location: RoleLocation, state: RoleState): RoleLocationDTO {
  return {
    id: location.id as string,
    city: location.city,
    locationState: roleStateToDTO(state),
    createdAt: location.createdAt,
  };
}

export function toDTOs(locations: RoleLocation[], states: RoleState[]): RoleLocationDTO[] {
  return locations.map((location, index) => toDTO(location, states[index]));
}
