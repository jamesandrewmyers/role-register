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
        valueSite: 'linkedin.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'title',
        cssSelector: 'h1[data-test-id="top-card-title"]',
        selectorOrder: 1,
        createdAt: 1704067200,
      }).returning().get();

      const result = valueMappingMapper.toDomain(mappingRow);

      expect(result.id).toBe('mapping-1');
      expect(result.valueSite).toBe('linkedin.com');
      expect(result.valueEntity).toBe('roleListing');
      expect(result.valueEntityProperty).toBe('title');
      expect(result.cssSelector).toBe('h1[data-test-id="top-card-title"]');
      expect(result.selectorOrder).toBe(1);
      expect(result.createdAt).toBe(1704067200);
    });

    it('should handle different entity properties', () => {
      const mappingRow = db.insert(valueMapping).values({
        id: 'mapping-2',
        valueSite: 'indeed.com',
        valueEntity: 'roleLocation',
        valueEntityProperty: 'city',
        cssSelector: '[data-testid="inlineHeader-companyLocation"]',
        selectorOrder: 1,
        createdAt: 1704067300,
      }).returning().get();

      const result = valueMappingMapper.toDomain(mappingRow);

      expect(result.valueSite).toBe('indeed.com');
      expect(result.valueEntity).toBe('roleLocation');
      expect(result.valueEntityProperty).toBe('city');
      expect(result.cssSelector).toBe('[data-testid="inlineHeader-companyLocation"]');
    });

    it('should handle optional selector description', () => {
      const mappingRow = db.insert(valueMapping).values({
        id: 'mapping-3',
        valueSite: 'indeed.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'description',
        cssSelector: 'div#jobDescriptionText',
        selectorOrder: 1,
        selectorDescription: 'Primary Indeed job description selector',
        createdAt: 1704067400,
      }).returning().get();

      const result = valueMappingMapper.toDomain(mappingRow);

      expect(result.selectorDescription).toBe('Primary Indeed job description selector');
      expect(result.cssSelector).toBe('div#jobDescriptionText');
    });

    it('should preserve type safety with branded ID', () => {
      const mappingRow = db.insert(valueMapping).values({
        id: 'mapping-4',
        valueSite: 'test.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'testProperty',
        cssSelector: '.test-selector',
        selectorOrder: 1,
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
        valueSite: 'indeed.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'title',
        cssSelector: 'h1.selector1',
        selectorOrder: 1,
        createdAt: 1704067600,
      }).returning().get();

      const mapping2 = db.insert(valueMapping).values({
        id: 'mapping-6',
        valueSite: 'linkedin.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'title',
        cssSelector: 'h1.selector2',
        selectorOrder: 1,
        createdAt: 1704067700,
      }).returning().get();

      const results = valueMappingMapper.toDomainMany([mapping1, mapping2]);

      expect(results).toHaveLength(2);
      expect(results[0].cssSelector).toBe('h1.selector1');
      expect(results[0].valueSite).toBe('indeed.com');
      expect(results[1].cssSelector).toBe('h1.selector2');
      expect(results[1].valueSite).toBe('linkedin.com');
    });

    it('should handle empty array', () => {
      const results = valueMappingMapper.toDomainMany([]);
      expect(results).toEqual([]);
    });

    it('should handle single item array', () => {
      const mapping = db.insert(valueMapping).values({
        id: 'mapping-7',
        valueSite: 'indeed.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'title',
        cssSelector: 'h1.job-title',
        selectorOrder: 1,
        createdAt: 1704067800,
      }).returning().get();

      const results = valueMappingMapper.toDomainMany([mapping]);

      expect(results).toHaveLength(1);
      expect(results[0].cssSelector).toBe('h1.job-title');
    });

    it('should preserve all properties in batch conversion', () => {
      const mappings = Array.from({ length: 5 }, (_, i) => 
        db.insert(valueMapping).values({
          id: `mapping-batch-${i}`,
          valueSite: `site-${i}.com`,
          valueEntity: 'roleListing',
          valueEntityProperty: `property-${i}`,
          cssSelector: `.selector-${i}`,
          selectorOrder: 1 + i,
          createdAt: 1704067900 + i,
        }).returning().get()
      );

      const results = valueMappingMapper.toDomainMany(mappings);

      expect(results).toHaveLength(5);
      results.forEach((result, i) => {
        expect(result.valueSite).toBe(`site-${i}.com`);
        expect(result.valueEntityProperty).toBe(`property-${i}`);
        expect(result.cssSelector).toBe(`.selector-${i}`);
        expect(result.selectorOrder).toBe(1 + i);
      });
    });
  });
});
