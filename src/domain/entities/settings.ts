export type SettingsId = string & { readonly brand: unique symbol };

export interface Settings {
  id: SettingsId;
  name: string;
  value: string;
  updatedAt: number;
}
