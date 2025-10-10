import type { RoleListing } from "./roleListing";

export type RoleQualificationsId = string & { readonly brand: unique symbol };

export interface RoleQualifications {
  id: RoleQualificationsId;
  listing: RoleListing;
  description: string;
  type: string;
  createdAt: number;
}
