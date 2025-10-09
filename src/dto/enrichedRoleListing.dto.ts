import type { RoleListingDTO } from "./roleListing.dto";
import type { RoleCompanyDTO } from "./roleCompany.dto";
import type { RoleLocationDTO } from "./roleLocation.dto";

/**
 * Enriched role listing DTO with joined company and location data
 * Used by dashboard and detail views
 */
export interface EnrichedRoleListingDTO extends Omit<RoleListingDTO, 'location'> {
  company?: RoleCompanyDTO | null;
  location?: RoleLocationDTO | null;
}
