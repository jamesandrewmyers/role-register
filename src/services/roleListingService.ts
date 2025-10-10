import { db } from "@/lib/db";
import { roleListing, roleCompany, roleLocation, roleState } from "@/lib/schema";
import { eq, desc, and, or, like } from "drizzle-orm";
import * as mapper from "@/domain/mappers/roleListingMapper";
import * as roleCompanyMapper from "@/domain/mappers/roleCompanyMapper";
import * as roleLocationMapper from "@/domain/mappers/roleLocationMapper";
import * as roleStateMapper from "@/domain/mappers/roleStateMapper";
import type { RoleListing, RoleListingId } from "@/domain/entities/roleListing";
import type { RoleCompany } from "@/domain/entities/roleCompany";
import type { RoleLocation } from "@/domain/entities/roleLocation";
import type { RoleState } from "@/domain/entities/roleState";
import type { DataReceivedId } from "@/domain/entities/dataReceived";

export interface RoleListingFilters {
  status?: string;
  companyId?: string;
  search?: string;
}

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

export function getRoleListingById(id: RoleListingId): RoleListing | null {
  const result = db
    .select()
    .from(roleListing)
    .where(eq(roleListing.id, id as string))
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

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

export function updateRoleListing(id: RoleListingId, data: UpdateRoleListingData): RoleListing | null {
  const result = db
    .update(roleListing)
    .set(data)
    .where(eq(roleListing.id, id as string))
    .returning()
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

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

export function deleteRoleListing(id: RoleListingId): boolean {
  const result = db
    .delete(roleListing)
    .where(eq(roleListing.id, id as string))
    .returning()
    .get();
  
  return !!result;
}

export function getListingByDataReceivedId(dataReceivedId: DataReceivedId): RoleListing | null {
  const result = db
    .select()
    .from(roleListing)
    .where(eq(roleListing.dataReceivedId, dataReceivedId as string))
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

export interface RoleListingWithRelations extends RoleListing {
  company?: RoleCompany | null;
}

export function getRoleListingWithRelations(id: RoleListingId): RoleListingWithRelations | null {
  const listing = getRoleListingById(id);
  if (!listing) return null;
  
  const result: RoleListingWithRelations = { ...listing };
  
  if (listing.companyId) {
    const companyRow = db
      .select()
      .from(roleCompany)
      .where(eq(roleCompany.id, listing.companyId as string))
      .get();
    
    if (companyRow) {
      result.company = roleCompanyMapper.toDomain(companyRow);
    }
  }
  
  return result;
}
