import type { RoleListingId } from "./roleListing";

export type RoleAttachmentId = string & { readonly brand: unique symbol };

export interface RoleAttachment {
  id: RoleAttachmentId;
  listingId: RoleListingId;
  type: string;
  pathOrUrl: string | null;
  createdAt: number;
}
