import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '@/test-db';
import { valueMapping } from '@/lib/schema';
import * as valueMappingMapper from '../valueMappingMapper';

let db: ReturnType<typeof createTestDb>['db'];

describe('valueMappingMapper', () => {
  beforeEach(() => {
    const testDb = createTestDb();
    db = testDb.db;
  });

  describe('toDomain', () => {
    it('should convert DB row to domain entity', () => {
      const mappingRow = db.insert(valueMapping).values({
        id: 'mapping-1',
        valueName: 'workArrangement',
        valueSource: 'linkedin',
        valueType: 'enum',
        valueEntity: 'roleListing',
        createdAt: 1704067200,
      }).returning().get();

      const result = valueMappingMapper.toDomain(mappingRow);

      expect(result.id).toBe('mapping-1');
      expect(result.valueName).toBe('workArrangement');
      expect(result.valueSource).toBe('linkedin');
      expect(result.valueType).toBe('enum');
      expect(result.valueEntity).toBe('roleListing');
      expect(result.createdAt).toBe(1704067200);
    });

    it('should handle different value mapping types', () => {
      const mappingRow = db.insert(valueMapping).values({
        id: 'mapping-2',
        valueName: 'eventType',
        valueSource: 'indeed',
        valueType: 'string',
        valueEntity: 'roleEvent',
        createdAt: 1704067300,
      }).returning().get();

      const result = valueMappingMapper.toDomain(mappingRow);

      expect(result.valueName).toBe('eventType');
      expect(result.valueSource).toBe('indeed');
      expect(result.valueType).toBe('string');
      expect(result.valueEntity).toBe('roleEvent');
    });

    it('should handle generic source values', () => {
      const mappingRow = db.insert(valueMapping).values({
        id: 'mapping-3',
        valueName: 'status',
        valueSource: 'generic',
        valueType: 'enum',
        valueEntity: 'roleListing',
        createdAt: 1704067400,
      }).returning().get();

      const result = valueMappingMapper.toDomain(mappingRow);

      expect(result.valueSource).toBe('generic');
    });

    it('should preserve type safety with branded ID', () => {
      const mappingRow = db.insert(valueMapping).values({
        id: 'mapping-4',
        valueName: 'testValue',
        valueSource: 'test',
        valueType: 'boolean',
        valueEntity: 'test',
        createdAt: 1704067500,
      }).returning().get();

      const result = valueMappingMapper.toDomain(mappingRow);

      // Verify the ID is properly branded
      expect(typeof result.id).toBe('string');
      expect(result.id).toBe('mapping-4');
    });
  });

  describe('toDomainMany', () => {
    it('should convert array of DB rows', () => {
      const mapping1 = db.insert(valueMapping).values({
        id: 'mapping-5',
        valueName: 'valueName1',
        valueSource: 'source1',
        valueType: 'type1',
        valueEntity: 'entity1',
        createdAt: 1704067600,
      }).returning().get();

      const mapping2 = db.insert(valueMapping).values({
        id: 'mapping-6',
        valueName: 'valueName2',
        valueSource: 'source2',
        valueType: 'type2',
        valueEntity: 'entity2',
        createdAt: 1704067700,
      }).returning().get();

      const results = valueMappingMapper.toDomainMany([mapping1, mapping2]);

      expect(results).toHaveLength(2);
      expect(results[0].valueName).toBe('valueName1');
      expect(results[0].valueSource).toBe('source1');
      expect(results[1].valueName).toBe('valueName2');
      expect(results[1].valueSource).toBe('source2');
    });

    it('should handle empty array', () => {
      const results = valueMappingMapper.toDomainMany([]);
      expect(results).toEqual([]);
    });

    it('should handle single item array', () => {
      const mapping = db.insert(valueMapping).values({
        id: 'mapping-7',
        valueName: 'singleMapping',
        valueSource: 'source',
        valueType: 'type',
        valueEntity: 'entity',
        createdAt: 1704067800,
      }).returning().get();

      const results = valueMappingMapper.toDomainMany([mapping]);

      expect(results).toHaveLength(1);
      expect(results[0].valueName).toBe('singleMapping');
    });

    it('should preserve all properties in batch conversion', () => {
      const mappings = Array.from({ length: 5 }, (_, i) => 
        db.insert(valueMapping).values({
          id: `mapping-batch-${i}`,
          valueName: `name-${i}`,
          valueSource: `source-${i}`,
          valueType: `type-${i}`,
          valueEntity: `entity-${i}`,
          createdAt: 1704067900 + i,
        }).returning().get()
      );

      const results = valueMappingMapper.toDomainMany(mappings);

      expect(results).toHaveLength(5);
      results.forEach((result, i) => {
        expect(result.valueName).toBe(`name-${i}`);
        expect(result.valueSource).toBe(`source-${i}`);
        expect(result.valueType).toBe(`type-${i}`);
        expect(result.valueEntity).toBe(`entity-${i}`);
      });
    });
  });
});
