import type { ValueMapping } from "@/domain/entities/valueMapping";

export interface ValueMappingDTO {
  id: string;
  valueName: string;
  valueSource: string;
  valueType: string;
  valueEntity: string;
  createdAt: number;
}

export function toDTO(entity: ValueMapping): ValueMappingDTO {
  return {
    id: entity.id as string,
    valueName: entity.valueName,
    valueSource: entity.valueSource,
    valueType: entity.valueType,
    valueEntity: entity.valueEntity,
    createdAt: entity.createdAt,
  };
}

export function toDTOs(entities: ValueMapping[]): ValueMappingDTO[] {
  return entities.map(toDTO);
}
