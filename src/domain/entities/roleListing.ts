import type { RoleCompany } from "./roleCompany";
import type { RoleLocation } from "./roleLocation";
import type { DataReceived } from "./dataReceived";

export type RoleListingId = string & { readonly brand: unique symbol };

export interface RoleListing {
  id: RoleListingId;
  company: RoleCompany | null;
  title: string;
  description: string;
  location: RoleLocation | null;
  workArrangement: string;
  capturedAt: number;
  dataReceived: DataReceived | null;
  status: string;
  appliedAt: number | null;
}
