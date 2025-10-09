import type { RoleListingId } from "./roleListing";

export type RoleContactId = string & { readonly brand: unique symbol };

export interface RoleContact {
  id: RoleContactId;
  listingId: RoleListingId;
  name: string;
  email: string | null;
  phone: string | null;
}
