import type { RoleListing } from "./roleListing";

export type RoleAttachmentId = string & { readonly brand: unique symbol };

export interface RoleAttachment {
  id: RoleAttachmentId;
  listing: RoleListing;
  type: string;
  pathOrUrl: string | null;
  createdAt: number;
}
