import type { roleCompany } from "@/lib/schema";
import type { RoleCompany, RoleCompanyId } from "../entities/roleCompany";

export function toDomain(dbResult: typeof roleCompany.$inferSelect): RoleCompany {
  return {
    id: dbResult.id as RoleCompanyId,
    name: dbResult.name,
    website: dbResult.website,
    createdAt: dbResult.createdAt,
  };
}

export function toDomainMany(dbResults: typeof roleCompany.$inferSelect[]): RoleCompany[] {
  return dbResults.map(toDomain);
}
