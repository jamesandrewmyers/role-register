export type ValueMappingId = string & { readonly brand: unique symbol };

export interface ValueMapping {
  id: ValueMappingId;
  valueName: string;
  valueSource: string;
  valueType: string;
  valueEntity: string;
  createdAt: number;
}
