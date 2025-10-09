import type { RoleListingId } from "./roleListing";

export type RoleEventId = string & { readonly brand: unique symbol };

export interface RoleEvent {
  id: RoleEventId;
  eventListingId: RoleListingId;
  eventType: string;
  eventTitle: string;
  eventDate: number | null;
  eventNotes: string | null;
}
