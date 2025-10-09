import type { RoleListingId } from "./roleListing";

export type RoleQualificationsId = string & { readonly brand: unique symbol };

export interface RoleQualifications {
  id: RoleQualificationsId;
  listingId: RoleListingId;
  description: string;
  type: string;
  createdAt: number;
}
