import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '@/test-db';
import { roleQualifications, roleListing } from '@/lib/schema';
import * as roleQualificationsMapper from '../roleQualificationsMapper';
let db: ReturnType<typeof createTestDb>['db'];
let rawDb: ReturnType<typeof createTestDb>['rawDb'];
import type { RoleQualifications } from '@/domain/entities/roleQualifications';
import type { RoleListing } from '@/domain/entities/roleListing';

describe('roleQualificationsMapper', () => {
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

      const qualRow = db.insert(roleQualifications).values({
        id: 'qual-1',
        listingId: 'listing-1',
        description: '5+ years of JavaScript experience',
        type: 'required',
        createdAt: 1704067200,
      }).returning().get();

      const result = roleQualificationsMapper.toDomain(qualRow, db);

      expect(result.id).toBe('qual-1');
      expect(result.description).toBe('5+ years of JavaScript experience');
      expect(result.type).toBe('required');
      expect(result.createdAt).toBe(1704067200);
      expect(result.listing.id).toBe('listing-1');
      expect(result.listing.title).toBe('Test Job');
    });

    it('should throw error when listingId points to non-existent record', () => {
      rawDb.exec('PRAGMA foreign_keys = OFF');
      
      const qualRow = db.insert(roleQualifications).values({
        id: 'qual-2',
        listingId: 'non-existent',
        description: 'Test requirement',
        type: 'required',
        createdAt: 1704067200,
      }).returning().get();

      rawDb.exec('PRAGMA foreign_keys = ON');

      expect(() => roleQualificationsMapper.toDomain(qualRow, db)).toThrow('RoleListing not found for id: non-existent');
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

      const qual: RoleQualifications = {
        id: 'qual-3' as any,
        listing: listing,
        description: 'Bachelor degree',
        type: 'nice-to-have',
        createdAt: 1704067300,
      };

      const result = roleQualificationsMapper.toPersistence(qual);

      expect(result.listingId).toBe('listing-2');
      expect(result.id).toBe('qual-3');
      expect(result.description).toBe('Bachelor degree');
      expect(result.type).toBe('nice-to-have');
      expect(result.createdAt).toBe(1704067300);
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

      const qual1 = db.insert(roleQualifications).values({
        id: 'qual-4',
        listingId: 'listing-3',
        description: 'Req 1',
        type: 'required',
        createdAt: 1704067200,
      }).returning().get();

      const qual2 = db.insert(roleQualifications).values({
        id: 'qual-5',
        listingId: 'listing-3',
        description: 'Req 2',
        type: 'nice-to-have',
        createdAt: 1704067200,
      }).returning().get();

      const results = roleQualificationsMapper.toDomainMany([qual1, qual2], db);

      expect(results).toHaveLength(2);
      expect(results[0].description).toBe('Req 1');
      expect(results[1].description).toBe('Req 2');
    });

    it('should handle empty array', () => {
      const results = roleQualificationsMapper.toDomainMany([], db);
      expect(results).toEqual([]);
    });
  });
});
