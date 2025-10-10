import type { RoleCompanyId } from "./roleCompany";
import type { RoleLocation } from "./roleLocation";
import type { DataReceivedId } from "./dataReceived";

export type RoleListingId = string & { readonly brand: unique symbol };

export interface RoleListing {
  id: RoleListingId;
  companyId: RoleCompanyId | null;
  title: string;
  description: string;
  location: RoleLocation | null;
  workArrangement: string;
  capturedAt: number;
  dataReceivedId: DataReceivedId | null;
  status: string;
  appliedAt: number | null;
}
