import type { RoleListing } from "./roleListing";

export type RoleContactId = string & { readonly brand: unique symbol };

export interface RoleContact {
  id: RoleContactId;
  listing: RoleListing;
  name: string;
  email: string | null;
  phone: string | null;
}
