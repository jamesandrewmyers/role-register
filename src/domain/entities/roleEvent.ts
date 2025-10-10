import type { RoleListing } from "./roleListing";

export type RoleEventId = string & { readonly brand: unique symbol };

export interface RoleEvent {
  id: RoleEventId;
  listing: RoleListing;
  eventType: string;
  eventTitle: string;
  eventDate: number | null;
  eventNotes: string | null;
}
