import type { RoleListing } from "./roleListing";

export type RoleCalloutId = string & { readonly brand: unique symbol };

export interface RoleCallout {
  id: RoleCalloutId;
  listing: RoleListing;
  content: string;
}
