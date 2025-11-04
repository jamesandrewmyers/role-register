import { db } from "@/lib/db";
import { roleListing } from "@/lib/schema";
import { eq, desc, and, or, like } from "drizzle-orm";
import * as mapper from "@/domain/mappers/roleListingMapper";
import type { RoleListing, RoleListingId } from "@/domain/entities/roleListing";
import type { DataReceivedId } from "@/domain/entities/dataReceived";

/**
 * Filter options for querying role listings
 *
 * @interface RoleListingFilters
 * @property {string} [status] - Filter by status (e.g., 'not_applied', 'applied', 'rejected')
 * @property {string} [companyId] - Filter by company ID
 * @property {string} [search] - Search query to match against title and description
 */
export interface RoleListingFilters {
  status?: string;
  companyId?: string;
  search?: string;
}

/**
 * Retrieves all role listings, optionally filtered by status, company, or search query.
 * Results are ordered by capture date in descending order.
 *
 * @param {RoleListingFilters} [filters] - Optional filter criteria
 * @returns {RoleListing[]} Array of role listings matching the filters
 *
 * @example
 * // Get all role listings
 * const all = getAllRoleListings();
 *
 * @example
 * // Get listings with filters
 * const listings = getAllRoleListings({
 *   status: 'applied',
 *   companyId: 'company-123',
 *   search: 'senior engineer'
 * });
 */
export function getAllRoleListings(filters?: RoleListingFilters): RoleListing[] {
  const conditions = [];

  if (filters?.status) {
    conditions.push(eq(roleListing.status, filters.status));
  }

  if (filters?.companyId) {
    conditions.push(eq(roleListing.companyId, filters.companyId));
  }

  if (filters?.search) {
    conditions.push(
      or(
        like(roleListing.title, `%${filters.search}%`),
        like(roleListing.description, `%${filters.search}%`)
      )
    );
  }

  const results = conditions.length > 0
    ? db.select().from(roleListing).where(and(...conditions)).orderBy(desc(roleListing.capturedAt)).all()
    : db.select().from(roleListing).orderBy(desc(roleListing.capturedAt)).all();

  return mapper.toDomainMany(results);
}

/**
 * Retrieves a single role listing by its ID.
 *
 * @param {RoleListingId} id - The unique identifier of the role listing
 * @returns {RoleListing | null} The role listing if found, null otherwise
 *
 * @example
 * const listing = getRoleListingById('listing-123');
 * if (listing) {
 *   console.log(listing.title);
 * }
 */
export function getRoleListingById(id: RoleListingId): RoleListing | null {
  const result = db
    .select()
    .from(roleListing)
    .where(eq(roleListing.id, id as string))
    .get();

  return result ? mapper.toDomain(result) : null;
}

/**
 * Data required to create a new role listing.
 *
 * @interface CreateRoleListingData
 * @property {string} id - Unique identifier (usually UUID)
 * @property {string | null} companyId - ID of the associated company
 * @property {string} title - Job title
 * @property {string} description - Full job description
 * @property {string | null} location - Job location
 * @property {string} workArrangement - Work arrangement type (e.g., 'remote', 'hybrid', 'onsite')
 * @property {number} capturedAt - Unix timestamp when the job was captured
 * @property {string | null} dataReceivedId - ID of the source DataReceived record
 * @property {string} [status] - Application status (default: 'not_applied')
 * @property {number | null} [appliedAt] - Unix timestamp when applied (if applicable)
 */
export interface CreateRoleListingData {
  id: string;
  companyId: string | null;
  title: string;
  description: string;
  location: string | null;
  workArrangement: string;
  capturedAt: number;
  dataReceivedId: string | null;
  status?: string;
  appliedAt?: number | null;
}

/**
 * Creates a new role listing in the database.
 *
 * @param {CreateRoleListingData} data - The role listing data to create
 * @returns {RoleListing} The created role listing
 *
 * @example
 * const listing = createRoleListing({
 *   id: 'listing-123',
 *   title: 'Senior Engineer',
 *   company: 'Acme Corp',
 *   description: '...',
 *   location: 'Remote',
 *   workArrangement: 'remote',
 *   capturedAt: Math.floor(Date.now() / 1000),
 *   dataReceivedId: 'received-456'
 * });
 */
export function createRoleListing(data: CreateRoleListingData): RoleListing {
  const result = db
    .insert(roleListing)
    .values({
      id: data.id,
      companyId: data.companyId,
      title: data.title,
      description: data.description,
      location: data.location,
      workArrangement: data.workArrangement,
      capturedAt: data.capturedAt,
      dataReceivedId: data.dataReceivedId,
      status: data.status || "not_applied",
      appliedAt: data.appliedAt || null,
    })
    .returning()
    .get();
  
  return mapper.toDomain(result);
}

/**
 * Partial data for updating an existing role listing.
 * All fields are optional - only provided fields will be updated.
 *
 * @interface UpdateRoleListingData
 * @property {string | null} [companyId] - Company ID
 * @property {string} [title] - Job title
 * @property {string} [description] - Job description
 * @property {string | null} [location] - Job location
 * @property {string} [workArrangement] - Work arrangement type
 * @property {number} [capturedAt] - Unix timestamp of capture date
 * @property {string} [status] - Application status
 * @property {number | null} [appliedAt] - Unix timestamp when applied
 */
export interface UpdateRoleListingData {
  companyId?: string | null;
  title?: string;
  description?: string;
  location?: string | null;
  workArrangement?: string;
  capturedAt?: number;
  status?: string;
  appliedAt?: number | null;
}

/**
 * Updates an existing role listing with the provided data.
 *
 * @param {RoleListingId} id - The ID of the role listing to update
 * @param {UpdateRoleListingData} data - Fields to update
 * @returns {RoleListing | null} The updated role listing, or null if not found
 *
 * @example
 * const updated = updateRoleListing('listing-123', {
 *   status: 'applied',
 *   appliedAt: Math.floor(Date.now() / 1000)
 * });
 */
export function updateRoleListing(id: RoleListingId, data: UpdateRoleListingData): RoleListing | null {
  const result = db
    .update(roleListing)
    .set(data)
    .where(eq(roleListing.id, id as string))
    .returning()
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

/**
 * Updates the status of a role listing and optionally the applied timestamp.
 *
 * @param {RoleListingId} id - The ID of the role listing
 * @param {string} status - The new status value
 * @param {number | null} [appliedAt] - Optional timestamp when application was sent
 * @returns {RoleListing | null} The updated role listing, or null if not found
 *
 * @example
 * const updated = updateRoleListingStatus('listing-123', 'applied');
 */
export function updateRoleListingStatus(
  id: RoleListingId,
  status: string,
  appliedAt?: number | null
): RoleListing | null {
  const updateData: Partial<typeof roleListing.$inferInsert> = { status };

  if (appliedAt !== undefined) {
    updateData.appliedAt = appliedAt;
  }

  const result = db
    .update(roleListing)
    .set(updateData)
    .where(eq(roleListing.id, id as string))
    .returning()
    .get();

  return result ? mapper.toDomain(result) : null;
}

/**
 * Deletes a role listing from the database.
 *
 * @param {RoleListingId} id - The ID of the role listing to delete
 * @returns {boolean} True if the listing was deleted, false if not found
 *
 * @example
 * const success = deleteRoleListing('listing-123');
 */
export function deleteRoleListing(id: RoleListingId): boolean {
  const result = db
    .delete(roleListing)
    .where(eq(roleListing.id, id as string))
    .returning()
    .get();

  return !!result;
}

/**
 * Retrieves a role listing by its associated DataReceived record ID.
 *
 * @param {DataReceivedId} dataReceivedId - The ID of the DataReceived record
 * @returns {RoleListing | null} The role listing if found, null otherwise
 *
 * @example
 * const listing = getListingByDataReceivedId('received-456');
 */
export function getListingByDataReceivedId(dataReceivedId: DataReceivedId): RoleListing | null {
  const result = db
    .select()
    .from(roleListing)
    .where(eq(roleListing.dataReceivedId, dataReceivedId as string))
    .get();

  return result ? mapper.toDomain(result) : null;
}

