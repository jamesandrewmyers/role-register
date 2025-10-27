export type ValueMappingId = string & { readonly brand: unique symbol };

export interface ValueMapping {
  id: ValueMappingId;
  valueSite: string; // e.g. "linkedin.com", "indeed.com"
  valueEntity: string; // e.g. "roleListing", "roleEvent"
  valueEntityProperty: string; // e.g. "title", "description", "city"
  cssSelector: string; // e.g. "h1.jobsearch-JobInfoHeader-title"
  selectorOrder: number; // Priority order (1 = first to try, 2 = fallback, etc.)
  selectorDescription?: string; // Optional human-friendly description
  createdAt: number;
  updatedAt?: number;
}
