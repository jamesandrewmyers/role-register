import type { EventInfo } from "@/domain/entities/eventInfo";

export interface EventInfoDTO {
  id: string;
  type: string;
  payload: string;
  status: string;
  createdAt: number;
  updatedAt: number | null;
  error: string | null;
  retries: number | null;
}

export function toDTO(entity: EventInfo): EventInfoDTO {
  return {
    id: entity.id as string,
    type: entity.type,
    payload: entity.payload,
    status: entity.status,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    error: entity.error,
    retries: entity.retries,
  };
}

export function toDTOs(entities: EventInfo[]): EventInfoDTO[] {
  return entities.map(toDTO);
}
