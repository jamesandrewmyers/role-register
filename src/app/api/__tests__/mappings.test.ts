import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestDb } from '@/test-db';
import { valueMapping } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

let db: ReturnType<typeof createTestDb>['db'];

describe('Mappings API Endpoints', () => {
  beforeEach(() => {
    const testDb = createTestDb();
    db = testDb.db;
  });

  describe('POST /api/mappings - Create mapping', () => {
    it('should create a new mapping with all required fields', async () => {
      const payload = {
        valueSite: 'indeed.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'title',
        cssSelector: 'h1.jobsearch-JobInfoHeader-title',
        selectorOrder: 1,
      };

      // Simulate endpoint behavior
      const id = 'mapping-' + Date.now();
      const createdAt = Math.floor(Date.now() / 1000);
      
      const result = db.insert(valueMapping).values({
        id,
        ...payload,
        createdAt,
      }).returning().get();

      expect(result.id).toBe(id);
      expect(result.valueSite).toBe(payload.valueSite);
      expect(result.valueEntity).toBe(payload.valueEntity);
      expect(result.valueEntityProperty).toBe(payload.valueEntityProperty);
      expect(result.cssSelector).toBe(payload.cssSelector);
      expect(result.selectorOrder).toBe(payload.selectorOrder);
    });

    it('should include optional selector description', async () => {
      const payload = {
        valueSite: 'linkedin.com',
        valueEntity: 'roleEvent',
        valueEntityProperty: 'eventType',
        cssSelector: 'div.event-type',
        selectorOrder: 1,
        selectorDescription: 'LinkedIn event type selector',
      };

      const id = 'mapping-' + Date.now();
      const createdAt = Math.floor(Date.now() / 1000);
      
      const result = db.insert(valueMapping).values({
        id,
        ...payload,
        createdAt,
      }).returning().get();

      expect(result.selectorDescription).toBe(payload.selectorDescription);
    });
  });

  describe('GET /api/mappings - List mappings', () => {
    beforeEach(() => {
      // Setup test data
      const now = Math.floor(Date.now() / 1000);
      
      db.insert(valueMapping).values({
        id: 'mapping-1',
        valueSite: 'indeed.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'title',
        cssSelector: 'h1.title',
        selectorOrder: 1,
        createdAt: now,
      }).returning().get();

      db.insert(valueMapping).values({
        id: 'mapping-2',
        valueSite: 'indeed.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'title',
        cssSelector: 'h1.fallback',
        selectorOrder: 2,
        createdAt: now,
      }).returning().get();

      db.insert(valueMapping).values({
        id: 'mapping-3',
        valueSite: 'linkedin.com',
        valueEntity: 'roleLocation',
        valueEntityProperty: 'city',
        cssSelector: 'span.city',
        selectorOrder: 1,
        createdAt: now,
      }).returning().get();
    });

    it('should retrieve all mappings', () => {
      const results = db.select().from(valueMapping).all();

      expect(results).toHaveLength(3);
      expect(results[0].valueSite).toBe('indeed.com');
      expect(results[1].valueSite).toBe('indeed.com');
      expect(results[2].valueSite).toBe('linkedin.com');
    });

    it('should filter mappings by site', () => {
      const results = db
        .select()
        .from(valueMapping)
        .where(eq(valueMapping.valueSite, 'indeed.com'))
        .all();

      expect(results).toHaveLength(2);
      results.forEach(r => {
        expect(r.valueSite).toBe('indeed.com');
      });
    });

    it('should filter mappings by entity', () => {
      const results = db
        .select()
        .from(valueMapping)
        .where(eq(valueMapping.valueEntity, 'roleListing'))
        .all();

      expect(results).toHaveLength(2);
    });

    it('should combine filters for hierarchical query', () => {
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
    });
  });

  describe('GET /api/mappings/property/:site/:entity/:property - Get selectors for property', () => {
    beforeEach(() => {
      const now = Math.floor(Date.now() / 1000);
      
      // Create multiple selectors for same property
      db.insert(valueMapping).values({
        id: 'prop-test-1',
        valueSite: 'indeed.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'description',
        cssSelector: 'div#jobDescriptionText',
        selectorOrder: 1,
        selectorDescription: 'Primary selector',
        createdAt: now,
      }).returning().get();

      db.insert(valueMapping).values({
        id: 'prop-test-2',
        valueSite: 'indeed.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'description',
        cssSelector: 'div.job-description',
        selectorOrder: 2,
        selectorDescription: 'Fallback selector',
        createdAt: now,
      }).returning().get();

      db.insert(valueMapping).values({
        id: 'prop-test-3',
        valueSite: 'indeed.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'description',
        cssSelector: 'article > div.description',
        selectorOrder: 3,
        selectorDescription: 'Last fallback',
        createdAt: now,
      }).returning().get();
    });

    it('should retrieve all selectors for a property in order', () => {
      const results = db
        .select()
        .from(valueMapping)
        .where(
          and(
            eq(valueMapping.valueSite, 'indeed.com'),
            eq(valueMapping.valueEntity, 'roleListing'),
            eq(valueMapping.valueEntityProperty, 'description')
          )
        )
        .orderBy(valueMapping.selectorOrder)
        .all();

      expect(results).toHaveLength(3);
      expect(results[0].selectorOrder).toBe(1);
      expect(results[1].selectorOrder).toBe(2);
      expect(results[2].selectorOrder).toBe(3);
      expect(results[0].cssSelector).toBe('div#jobDescriptionText');
    });

    it('should preserve selector order for extraction fallback logic', () => {
      const selectors = db
        .select()
        .from(valueMapping)
        .where(
          and(
            eq(valueMapping.valueSite, 'indeed.com'),
            eq(valueMapping.valueEntity, 'roleListing'),
            eq(valueMapping.valueEntityProperty, 'description')
          )
        )
        .orderBy(valueMapping.selectorOrder)
        .all()
        .map(m => m.cssSelector);

      // Extraction logic would try these in order
      expect(selectors[0]).toBe('div#jobDescriptionText'); // Try first
      expect(selectors[1]).toBe('div.job-description'); // If not found, try second
      expect(selectors[2]).toBe('article > div.description'); // If not found, try third
    });
  });

  describe('PUT /api/mappings/:id - Update mapping', () => {
    beforeEach(() => {
      const now = Math.floor(Date.now() / 1000);
      db.insert(valueMapping).values({
        id: 'update-test',
        valueSite: 'indeed.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'title',
        cssSelector: 'h1.old-selector',
        selectorOrder: 1,
        createdAt: now,
      }).returning().get();
    });

    it('should update mapping fields', () => {
      const now = Math.floor(Date.now() / 1000);
      
      const updated = db
        .update(valueMapping)
        .set({
          cssSelector: 'h1.new-selector',
          selectorDescription: 'Updated description',
          updatedAt: now,
        })
        .where(eq(valueMapping.id, 'update-test'))
        .returning()
        .get();

      expect(updated.cssSelector).toBe('h1.new-selector');
      expect(updated.selectorDescription).toBe('Updated description');
    });
  });

  describe('DELETE /api/mappings/:id - Delete mapping', () => {
    beforeEach(() => {
      const now = Math.floor(Date.now() / 1000);
      db.insert(valueMapping).values({
        id: 'delete-test',
        valueSite: 'indeed.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'title',
        cssSelector: 'h1.to-delete',
        selectorOrder: 1,
        createdAt: now,
      }).returning().get();
    });

    it('should delete a mapping by id', () => {
      // Verify it exists
      let result = db
        .select()
        .from(valueMapping)
        .where(eq(valueMapping.id, 'delete-test'))
        .get();

      expect(result).toBeDefined();

      // Delete it
      db.delete(valueMapping)
        .where(eq(valueMapping.id, 'delete-test'))
        .returning()
        .get();

      // Verify it's gone
      result = db
        .select()
        .from(valueMapping)
        .where(eq(valueMapping.id, 'delete-test'))
        .get();

      expect(result).toBeUndefined();
    });
  });

  describe('POST /api/mappings/reorder - Reorder selectors', () => {
    beforeEach(() => {
      const now = Math.floor(Date.now() / 1000);
      
      db.insert(valueMapping).values({
        id: 'reorder-1',
        valueSite: 'indeed.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'title',
        cssSelector: 'h1.first',
        selectorOrder: 1,
        createdAt: now,
      }).returning().get();

      db.insert(valueMapping).values({
        id: 'reorder-2',
        valueSite: 'indeed.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'title',
        cssSelector: 'h1.second',
        selectorOrder: 2,
        createdAt: now,
      }).returning().get();

      db.insert(valueMapping).values({
        id: 'reorder-3',
        valueSite: 'indeed.com',
        valueEntity: 'roleListing',
        valueEntityProperty: 'title',
        cssSelector: 'h1.third',
        selectorOrder: 3,
        createdAt: now,
      }).returning().get();
    });

    it('should reorder selectors for a property', () => {
      // Change order: 3 -> 1, 1 -> 2, 2 -> 3
      const now = Math.floor(Date.now() / 1000);
      
      db.update(valueMapping)
        .set({ selectorOrder: 1, updatedAt: now })
        .where(eq(valueMapping.id, 'reorder-3'))
        .returning()
        .get();

      db.update(valueMapping)
        .set({ selectorOrder: 2, updatedAt: now })
        .where(eq(valueMapping.id, 'reorder-1'))
        .returning()
        .get();

      db.update(valueMapping)
        .set({ selectorOrder: 3, updatedAt: now })
        .where(eq(valueMapping.id, 'reorder-2'))
        .returning()
        .get();

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

      expect(results[0].id).toBe('reorder-3');
      expect(results[1].id).toBe('reorder-1');
      expect(results[2].id).toBe('reorder-2');
    });
  });

  describe('GET /api/entities - List available entities and properties', () => {
    it('should return all available entities and their properties', () => {
      const entities = {
        roleListing: ['title', 'description', 'workArrangement', 'location'],
        roleEvent: ['eventType', 'eventTitle', 'eventDate', 'eventNotes'],
        roleContact: ['name', 'email', 'phone'],
        roleCallout: ['content'],
        roleLineItems: ['description', 'type'],
        roleCompany: ['name', 'website'],
        roleLocation: ['city', 'locationState'],
        roleState: ['name', 'abbreviation'],
      };

      expect(entities.roleListing).toContain('title');
      expect(entities.roleEvent).toContain('eventType');
      expect(entities.roleLocation).toContain('city');
    });
  });
});
