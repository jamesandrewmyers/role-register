import { db } from "@/lib/db";
import { roleCompany } from "@/lib/schema";
import { eq } from "drizzle-orm";
import * as mapper from "@/domain/mappers/roleCompanyMapper";
import type { RoleCompany, RoleCompanyId } from "@/domain/entities/roleCompany";

export function getAllCompanies(): RoleCompany[] {
  const results = db.select().from(roleCompany).all();
  return mapper.toDomainMany(results);
}

export function getCompanyById(id: RoleCompanyId): RoleCompany | null {
  const result = db
    .select()
    .from(roleCompany)
    .where(eq(roleCompany.id, id as string))
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

export function getCompanyByName(name: string): RoleCompany | null {
  const result = db
    .select()
    .from(roleCompany)
    .where(eq(roleCompany.name, name))
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

export interface CreateCompanyData {
  id: string;
  name: string;
  website?: string | null;
  createdAt?: number;
}

export function createCompany(data: CreateCompanyData): RoleCompany {
  const result = db
    .insert(roleCompany)
    .values({
      id: data.id,
      name: data.name,
      website: data.website || null,
      createdAt: data.createdAt || Math.floor(Date.now() / 1000),
    })
    .returning()
    .get();
  
  return mapper.toDomain(result);
}

export function getOrCreateCompany(name: string, id?: string): RoleCompany {
  const existing = getCompanyByName(name);
  if (existing) return existing;
  
  return createCompany({
    id: id || crypto.randomUUID(),
    name,
  });
}

export function updateCompany(
  id: RoleCompanyId,
  data: { name?: string; website?: string | null }
): RoleCompany | null {
  const result = db
    .update(roleCompany)
    .set(data)
    .where(eq(roleCompany.id, id as string))
    .returning()
    .get();
  
  return result ? mapper.toDomain(result) : null;
}

export function deleteCompany(id: RoleCompanyId): boolean {
  const result = db
    .delete(roleCompany)
    .where(eq(roleCompany.id, id as string))
    .returning()
    .get();
  
  return !!result;
}
