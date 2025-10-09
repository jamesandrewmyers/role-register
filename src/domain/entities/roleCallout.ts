import type { RoleListingId } from "./roleListing";

export type RoleCalloutId = string & { readonly brand: unique symbol };

export interface RoleCallout {
  id: RoleCalloutId;
  listingId: RoleListingId;
  content: string;
}
