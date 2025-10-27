import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '@/test-db';
import { valueMapping } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

let db: ReturnType<typeof createTestDb>['db'];

describe('valueMapping schema', () => {
  beforeEach(() => {
    const testDb = createTestDb();
    db = testDb.db;
  });

  describe('basic insertion and retrieval', () => {
    it('should insert a value mapping with all required fields', () => {
      const result = db.insert(valueMapping).values({
        id: 'mapping-1',
        valueSite: 'indeed.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'title',
        cssSelector: 'h1.jobsearch-JobInfoHeader-title',
        selectorOrder: 1,
        createdAt: Math.floor(Date.now() / 1000),
      }).returning().get();

      expect(result.id).toBe('mapping-1');
      expect(result.valueSite).toBe('indeed.com');
      expect(result.valueEntity).toBe('roleListing');
      expect(result.valueEntityProperty).toBe('title');
      expect(result.cssSelector).toBe('h1.jobsearch-JobInfoHeader-title');
      expect(result.selectorOrder).toBe(1);
    });

    it('should insert a mapping with optional selector_description', () => {
      const result = db.insert(valueMapping).values({
        id: 'mapping-2',
        valueSite: 'linkedin.com',
        valueEntity: 'roleContact',
        valueEntityProperty: 'email',
        cssSelector: 'span[data-testid="email"]',
        selectorOrder: 1,
        selectorDescription: 'Email field on LinkedIn contact info',
        createdAt: Math.floor(Date.now() / 1000),
      }).returning().get();

      expect(result.id).toBe('mapping-2');
      expect(result.selectorDescription).toBe('Email field on LinkedIn contact info');
    });

    it('should support multiple selectors for same entity property', () => {
      const now = Math.floor(Date.now() / 1000);
      
      // First selector
      const mapping1 = db.insert(valueMapping).values({
        id: 'mapping-3a',
        valueSite: 'indeed.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'title',
        cssSelector: 'h1.jobsearch-JobInfoHeader-title',
        selectorOrder: 1,
        selectorDescription: 'Primary Indeed title selector',
        createdAt: now,
      }).returning().get();

      // Second selector (fallback)
      const mapping2 = db.insert(valueMapping).values({
        id: 'mapping-3b',
        valueSite: 'indeed.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'title',
        cssSelector: 'h1[data-testid="job-title"]',
        selectorOrder: 2,
        selectorDescription: 'Fallback Indeed title selector',
        createdAt: now,
      }).returning().get();

      // Retrieve both in order
      const results = db
        .select()
        .from(valueMapping)
        .where(
          and(
            eq(valueMapping.valueSite, 'indeed.com'),
            eq(valueMapping.valueEntity, 'roleListing'),
            eq(valueMapping.valueEntityProperty, 'title')
          )
        )
        .orderBy(valueMapping.selectorOrder)
        .all();

      expect(results).toHaveLength(2);
      expect(results[0].selectorOrder).toBe(1);
      expect(results[1].selectorOrder).toBe(2);
      expect(results[0].cssSelector).toBe('h1.jobsearch-JobInfoHeader-title');
      expect(results[1].cssSelector).toBe('h1[data-testid="job-title"]');
    });
  });

  describe('selector ordering', () => {
    it('should retrieve selectors in correct priority order', () => {
      const now = Math.floor(Date.now() / 1000);
      const site = 'indeed.com';
      const entity = 'roleLocation';
      const property = 'city';

      // Insert in random order
      db.insert(valueMapping).values({
        id: 'order-test-3',
        valueSite: site,
        valueEntity: entity,
        valueEntityProperty: property,
        cssSelector: '[data-testid="city-tertiary"]',
        selectorOrder: 3,
        createdAt: now,
      }).returning().get();

      db.insert(valueMapping).values({
        id: 'order-test-1',
        valueSite: site,
        valueEntity: entity,
        valueEntityProperty: property,
        cssSelector: '[data-testid="city-primary"]',
        selectorOrder: 1,
        createdAt: now,
      }).returning().get();

      db.insert(valueMapping).values({
        id: 'order-test-2',
        valueSite: site,
        valueEntity: entity,
        valueEntityProperty: property,
        cssSelector: '[data-testid="city-secondary"]',
        selectorOrder: 2,
        createdAt: now,
      }).returning().get();

      const results = db
        .select()
        .from(valueMapping)
        .where(
          and(
            eq(valueMapping.valueSite, site),
            eq(valueMapping.valueEntity, entity),
            eq(valueMapping.valueEntityProperty, property)
          )
        )
        .orderBy(valueMapping.selectorOrder)
        .all();

      expect(results).toHaveLength(3);
      expect(results[0].selectorOrder).toBe(1);
      expect(results[1].selectorOrder).toBe(2);
      expect(results[2].selectorOrder).toBe(3);
      expect(results[0].cssSelector).toContain('primary');
      expect(results[1].cssSelector).toContain('secondary');
      expect(results[2].cssSelector).toContain('tertiary');
    });
  });

  describe('different sites and entities', () => {
    it('should support multiple sites with same entity/property', () => {
      const now = Math.floor(Date.now() / 1000);

      // Indeed selector
      db.insert(valueMapping).values({
        id: 'site-test-indeed',
        valueSite: 'indeed.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'description',
        cssSelector: 'div#jobDescriptionText',
        selectorOrder: 1,
        createdAt: now,
      }).returning().get();

      // LinkedIn selector
      db.insert(valueMapping).values({
        id: 'site-test-linkedin',
        valueSite: 'linkedin.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'description',
        cssSelector: 'div.description__text',
        selectorOrder: 1,
        createdAt: now,
      }).returning().get();

      const indeedResults = db
        .select()
        .from(valueMapping)
        .where(eq(valueMapping.valueSite, 'indeed.com'))
        .all();

      const linkedinResults = db
        .select()
        .from(valueMapping)
        .where(eq(valueMapping.valueSite, 'linkedin.com'))
        .all();

      expect(indeedResults).toHaveLength(1);
      expect(linkedinResults).toHaveLength(1);
      expect(indeedResults[0].cssSelector).toBe('div#jobDescriptionText');
      expect(linkedinResults[0].cssSelector).toBe('div.description__text');
    });
  });

  describe('complex selectors', () => {
    it('should support various CSS selector formats', () => {
      const now = Math.floor(Date.now() / 1000);

      const selectors = [
        '#job-full-details',
        'h1.jobsearch-JobInfoHeader-title',
        '[data-testid="inlineHeader-companyLocation"]',
        'span.job-details-empasis-icon-text',
        'div > span.salary-info',
        'section[aria-label="Job details"] > h2',
      ];

      selectors.forEach((selector, index) => {
        db.insert(valueMapping).values({
          id: `selector-${index}`,
          valueSite: 'test.com',
          valueEntity: 'roleListing',
          valueEntityProperty: `property${index}`,
          cssSelector: selector,
          selectorOrder: 1,
          createdAt: now,
        }).returning().get();
      });

      const results = db
        .select()
        .from(valueMapping)
        .where(eq(valueMapping.valueSite, 'test.com'))
        .all();

      expect(results).toHaveLength(selectors.length);
      results.forEach((result, index) => {
        expect(result.cssSelector).toBe(selectors[index]);
      });
    });
  });
});
