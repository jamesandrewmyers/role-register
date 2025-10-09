export type EventInfoId = string & { readonly brand: unique symbol };

export interface EventInfo {
  id: EventInfoId;
  type: string;
  payload: string;
  status: string;
  createdAt: number;
  updatedAt: number | null;
  error: string | null;
  retries: number | null;
}
