import { db } from "@/lib/db";
import { roleQualifications } from "@/lib/schema";
import { eq } from "drizzle-orm";
import * as mapper from "@/domain/mappers/roleQualificationsMapper";
import type { RoleQualifications, RoleQualificationsId } from "@/domain/entities/roleQualifications";
import type { RoleListingId } from "@/domain/entities/roleListing";

export function getQualificationsByListingId(listingId: RoleListingId): RoleQualifications[] {
  const results = db
    .select()
    .from(roleQualifications)
    .where(eq(roleQualifications.listingId, listingId as string))
    .all();
  
  return mapper.toDomainMany(results);
}

export interface CreateQualificationData {
  id: string;
  listingId: string;
  description: string;
  type: string;
  createdAt?: number;
}

export function createQualification(data: CreateQualificationData): RoleQualifications {
  const result = db
    .insert(roleQualifications)
    .values({
      id: data.id,
      listingId: data.listingId,
      description: data.description,
      type: data.type,
      createdAt: data.createdAt || Math.floor(Date.now() / 1000),
    })
    .returning()
    .get();
  
  return mapper.toDomain(result);
}

export function createQualifications(
  listingId: RoleListingId,
  qualifications: CreateQualificationData[]
): RoleQualifications[] {
  if (qualifications.length === 0) return [];
  
  const results = db
    .insert(roleQualifications)
    .values(
      qualifications.map((q) => ({
        id: q.id,
        listingId: listingId as string,
        description: q.description,
        type: q.type,
        createdAt: q.createdAt || Math.floor(Date.now() / 1000),
      }))
    )
    .returning()
    .all();
  
  return mapper.toDomainMany(results);
}

export function deleteQualificationsByListingId(listingId: RoleListingId): number {
  const result = db
    .delete(roleQualifications)
    .where(eq(roleQualifications.listingId, listingId as string))
    .returning()
    .all();
  
  return result.length;
}

export function deleteQualification(id: RoleQualificationsId): boolean {
  const result = db
    .delete(roleQualifications)
    .where(eq(roleQualifications.id, id as string))
    .returning()
    .get();
  
  return !!result;
}
