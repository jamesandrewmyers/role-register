export type RoleCompanyId = string & { readonly brand: unique symbol };

export interface RoleCompany {
  id: RoleCompanyId;
  name: string;
  website: string | null;
  createdAt: number;
}
