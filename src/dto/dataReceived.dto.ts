import type { DataReceived } from "@/domain/entities/dataReceived";

export interface DataReceivedDTO {
  id: string;
  url: string;
  title: string;
  html: string;
  text: string;
  receivedAt: number;
  processed: string | null;
  processingNotes: string | null;
}

export function toDTO(entity: DataReceived): DataReceivedDTO {
  return {
    id: entity.id as string,
    url: entity.url,
    title: entity.title,
    html: entity.html,
    text: entity.text,
    receivedAt: entity.receivedAt,
    processed: entity.processed,
    processingNotes: entity.processingNotes,
  };
}

export function toDTOs(entities: DataReceived[]): DataReceivedDTO[] {
  return entities.map(toDTO);
}
