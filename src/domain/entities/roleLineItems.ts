import type { RoleListing } from "./roleListing";

export type RoleLineItemsId = string & { readonly brand: unique symbol };

export type LineItemType = "requirement" | "nice to have" | "benefit" | "responsibility";

export interface RoleLineItems {
  id: RoleLineItemsId;
  listing: RoleListing;
  description: string;
  type: LineItemType;
  createdAt: number;
}
