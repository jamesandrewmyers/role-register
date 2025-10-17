import type { RoleLineItems, LineItemType } from "@/domain/entities/roleLineItems";

export interface RoleLineItemsDTO {
  id: string;
  listingId: string;
  description: string;
  type: LineItemType;
  createdAt: number;
}

export function toDTO(entity: RoleLineItems): RoleLineItemsDTO {
  return {
    id: entity.id as string,
    listingId: entity.listing.id as string,
    description: entity.description,
    type: entity.type,
    createdAt: entity.createdAt,
  };
}

export function toDTOs(entities: RoleLineItems[]): RoleLineItemsDTO[] {
  return entities.map(toDTO);
}
