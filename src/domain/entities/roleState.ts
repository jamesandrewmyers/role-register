export type RoleStateId = string & { readonly brand: unique symbol };

export interface RoleState {
  id: RoleStateId;
  name: string;
  abbreviation: string;
  createdAt: number;
}
