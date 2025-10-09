export type DataReceivedId = string & { readonly brand: unique symbol };

export interface DataReceived {
  id: DataReceivedId;
  url: string;
  title: string;
  html: string;
  text: string;
  receivedAt: number;
  processed: string | null;
  processingNotes: string | null;
}
