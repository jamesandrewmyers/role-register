import type { RoleStateId } from "./roleState";

export type RoleLocationId = string & { readonly brand: unique symbol };

export interface RoleLocation {
  id: RoleLocationId;
  locationState: RoleStateId;
  city: string;
  createdAt: number;
}
