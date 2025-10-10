import type { RoleEvent } from "@/domain/entities/roleEvent";

export interface RoleEventDTO {
  id: string;
  eventListingId: string;
  eventType: string;
  eventTitle: string;
  eventDate: number | null;
  eventNotes: string | null;
}

export function toDTO(entity: RoleEvent): RoleEventDTO {
  return {
    id: entity.id as string,
    eventListingId: entity.listing.id as string,
    eventType: entity.eventType,
    eventTitle: entity.eventTitle,
    eventDate: entity.eventDate,
    eventNotes: entity.eventNotes,
  };
}

export function toDTOs(entities: RoleEvent[]): RoleEventDTO[] {
  return entities.map(toDTO);
}
