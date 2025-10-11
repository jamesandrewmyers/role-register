import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '@/test-db';
import { roleCallout, roleListing } from '@/lib/schema';
import * as roleCalloutMapper from '../roleCalloutMapper';
let db: ReturnType<typeof createTestDb>['db'];
let rawDb: ReturnType<typeof createTestDb>['rawDb'];
import type { RoleCallout } from '@/domain/entities/roleCallout';
import type { RoleListing } from '@/domain/entities/roleListing';

describe('roleCalloutMapper', () => {
  beforeEach(() => {
    const testDb = createTestDb();
    db = testDb.db;
    rawDb = testDb.rawDb;
  });


  describe('toDomain', () => {
    it('should fetch and nest RoleListing entity', () => {
      db.insert(roleListing).values({
        id: 'listing-1',
        companyId: null,
        title: 'Test Job',
        description: 'Description',
        location: null,
        workArrangement: 'remote',
        capturedAt: 1704067200,
        dataReceivedId: null,
        status: 'not_applied',
        appliedAt: null,
      }).run();

      const calloutRow = db.insert(roleCallout).values({
        id: 'callout-1',
        listingId: 'listing-1',
        content: 'Great company culture!',
      }).returning().get();

      const result = roleCalloutMapper.toDomain(calloutRow, db);

      expect(result.id).toBe('callout-1');
      expect(result.content).toBe('Great company culture!');
      expect(result.listing.id).toBe('listing-1');
      expect(result.listing.title).toBe('Test Job');
    });

    it('should throw error when listingId points to non-existent record', () => {
      rawDb.exec('PRAGMA foreign_keys = OFF');
      
      const calloutRow = db.insert(roleCallout).values({
        id: 'callout-2',
        listingId: 'non-existent',
        content: 'Test callout',
      }).returning().get();

      rawDb.exec('PRAGMA foreign_keys = ON');

      expect(() => roleCalloutMapper.toDomain(calloutRow, db)).toThrow('RoleListing not found for id: non-existent');
    });
  });

  describe('toPersistence', () => {
    it('should extract listing.id to listingId field', () => {
      const listing: RoleListing = {
        id: 'listing-2' as any,
        company: null,
        title: 'Test',
        description: 'Test',
        location: null,
        workArrangement: 'remote',
        capturedAt: 1704067200,
        dataReceived: null,
        status: 'not_applied',
        appliedAt: null,
      };

      const callout: RoleCallout = {
        id: 'callout-3' as any,
        listing: listing,
        content: 'Exciting opportunity',
      };

      const result = roleCalloutMapper.toPersistence(callout);

      expect(result.listingId).toBe('listing-2');
      expect(result.id).toBe('callout-3');
      expect(result.content).toBe('Exciting opportunity');
    });
  });

  describe('toDomainMany', () => {
    it('should convert array of DB rows', () => {
      db.insert(roleListing).values({
        id: 'listing-3',
        companyId: null,
        title: 'Job',
        description: 'Desc',
        location: null,
        workArrangement: 'remote',
        capturedAt: 1704067200,
        dataReceivedId: null,
        status: 'not_applied',
        appliedAt: null,
      }).run();

      const callout1 = db.insert(roleCallout).values({
        id: 'callout-4',
        listingId: 'listing-3',
        content: 'Callout 1',
      }).returning().get();

      const callout2 = db.insert(roleCallout).values({
        id: 'callout-5',
        listingId: 'listing-3',
        content: 'Callout 2',
      }).returning().get();

      const results = roleCalloutMapper.toDomainMany([callout1, callout2], db);

      expect(results).toHaveLength(2);
      expect(results[0].content).toBe('Callout 1');
      expect(results[1].content).toBe('Callout 2');
    });

    it('should handle empty array', () => {
      const results = roleCalloutMapper.toDomainMany([], db);
      expect(results).toEqual([]);
    });
  });
});
