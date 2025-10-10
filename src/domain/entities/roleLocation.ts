import type { RoleState } from "./roleState";

export type RoleLocationId = string & { readonly brand: unique symbol };

export interface RoleLocation {
  id: RoleLocationId;
  state: RoleState;
  city: string;
  createdAt: number;
}
