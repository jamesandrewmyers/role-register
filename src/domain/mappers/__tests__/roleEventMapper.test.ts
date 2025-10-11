import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '@/test-db';
import { roleEvent, roleListing, roleCompany, roleLocation, roleState } from '@/lib/schema';
import * as roleEventMapper from '../roleEventMapper';
let db: ReturnType<typeof createTestDb>['db'];
let rawDb: ReturnType<typeof createTestDb>['rawDb'];
import type { RoleEvent } from '@/domain/entities/roleEvent';
import type { RoleListing } from '@/domain/entities/roleListing';

describe('roleEventMapper', () => {
  beforeEach(() => {
    const testDb = createTestDb();
    db = testDb.db;
    rawDb = testDb.rawDb;
  });


  describe('toDomain - Fetch Required RoleListing', () => {
    it('should fetch and nest full RoleListing entity', () => {
      const stateRow = db.insert(roleState).values({
        id: 'state-1',
        name: 'Oregon',
        abbreviation: 'OR',
        createdAt: 1704067200,
      }).returning().get();

      const companyRow = db.insert(roleCompany).values({
        id: 'company-1',
        name: 'Test Company',
        website: 'https://test.com',
        createdAt: 1704067200,
      }).returning().get();

      const locationRow = db.insert(roleLocation).values({
        id: 'location-1',
        locationState: 'state-1',
        city: 'Portland',
        createdAt: 1704067200,
      }).returning().get();

      const listingRow = db.insert(roleListing).values({
        id: 'listing-1',
        companyId: 'company-1',
        title: 'Senior Software Engineer',
        description: 'Test description',
        location: 'location-1',
        workArrangement: 'remote',
        capturedAt: 1704067200,
        dataReceivedId: null,
        status: 'not_applied',
        appliedAt: null,
      }).returning().get();

      const eventRow = db.insert(roleEvent).values({
        id: 'event-1',
        eventListingId: 'listing-1',
        eventType: 'Application',
        eventTitle: 'Applied online',
        eventDate: 1704067300,
        eventNotes: 'Submitted via LinkedIn',
      }).returning().get();

      const result = roleEventMapper.toDomain(eventRow, db);

      expect(result.id).toBe('event-1');
      expect(result.eventType).toBe('Application');
      expect(result.eventTitle).toBe('Applied online');
      expect(result.eventDate).toBe(1704067300);
      expect(result.eventNotes).toBe('Submitted via LinkedIn');
      
      expect(result.listing).not.toBeNull();
      expect(result.listing.id).toBe('listing-1');
      expect(result.listing.title).toBe('Senior Software Engineer');
      expect(result.listing.company?.name).toBe('Test Company');
      expect(result.listing.location?.city).toBe('Portland');
      expect(result.listing.location?.state.abbreviation).toBe('OR');
    });

    it('should throw error when eventListingId points to non-existent record', () => {
      rawDb.exec('PRAGMA foreign_keys = OFF');
      
      const eventRow = db.insert(roleEvent).values({
        id: 'event-2',
        eventListingId: 'non-existent-listing',
        eventType: 'Interview',
        eventTitle: 'Phone Screen',
        eventDate: null,
        eventNotes: null,
      }).returning().get();

      rawDb.exec('PRAGMA foreign_keys = ON');

      expect(() => roleEventMapper.toDomain(eventRow, db)).toThrow('RoleListing not found for id: non-existent-listing');
    });

    it('should handle RoleListing with all nested objects', () => {
      const stateRow = db.insert(roleState).values({
        id: 'state-2',
        name: 'California',
        abbreviation: 'CA',
        createdAt: 1704067200,
      }).returning().get();

      const companyRow = db.insert(roleCompany).values({
        id: 'company-2',
        name: 'Tech Corp',
        website: null,
        createdAt: 1704067200,
      }).returning().get();

      const locationRow = db.insert(roleLocation).values({
        id: 'location-2',
        locationState: 'state-2',
        city: 'San Francisco',
        createdAt: 1704067200,
      }).returning().get();

      const listingRow = db.insert(roleListing).values({
        id: 'listing-2',
        companyId: 'company-2',
        title: 'Backend Engineer',
        description: 'Backend role',
        location: 'location-2',
        workArrangement: 'hybrid',
        capturedAt: 1704067200,
        dataReceivedId: null,
        status: 'applied',
        appliedAt: 1704067300,
      }).returning().get();

      const eventRow = db.insert(roleEvent).values({
        id: 'event-3',
        eventListingId: 'listing-2',
        eventType: 'Interview',
        eventTitle: 'Technical Interview',
        eventDate: 1704067400,
        eventNotes: 'Went well',
      }).returning().get();

      const result = roleEventMapper.toDomain(eventRow, db);

      expect(result.listing.company?.name).toBe('Tech Corp');
      expect(result.listing.location?.city).toBe('San Francisco');
      expect(result.listing.location?.state.name).toBe('California');
    });

    it('should handle RoleListing with null optional fields', () => {
      const listingRow = db.insert(roleListing).values({
        id: 'listing-3',
        companyId: null,
        title: 'Job without company',
        description: 'Description',
        location: null,
        workArrangement: 'remote',
        capturedAt: 1704067200,
        dataReceivedId: null,
        status: 'not_applied',
        appliedAt: null,
      }).returning().get();

      const eventRow = db.insert(roleEvent).values({
        id: 'event-4',
        eventListingId: 'listing-3',
        eventType: 'Email',
        eventTitle: 'Follow-up email',
        eventDate: null,
        eventNotes: null,
      }).returning().get();

      const result = roleEventMapper.toDomain(eventRow, db);

      expect(result.listing.company).toBe(null);
      expect(result.listing.location).toBe(null);
      expect(result.eventDate).toBe(null);
      expect(result.eventNotes).toBe(null);
    });
  });

  describe('toPersistence - Extract Listing ID', () => {
    it('should extract listing.id to eventListingId field', () => {
      const listing: RoleListing = {
        id: 'listing-4' as any,
        company: null,
        title: 'Test Job',
        description: 'Description',
        location: null,
        workArrangement: 'remote',
        capturedAt: 1704067200,
        dataReceived: null,
        status: 'not_applied',
        appliedAt: null,
      };

      const event: RoleEvent = {
        id: 'event-5' as any,
        listing: listing,
        eventType: 'Application',
        eventTitle: 'Applied',
        eventDate: 1704067300,
        eventNotes: 'Good fit',
      };

      const result = roleEventMapper.toPersistence(event);

      expect(result.eventListingId).toBe('listing-4');
      expect(result.id).toBe('event-5');
      expect(result.eventType).toBe('Application');
      expect(result.eventTitle).toBe('Applied');
      expect(result.eventDate).toBe(1704067300);
      expect(result.eventNotes).toBe('Good fit');
    });

    it('should preserve all other entity properties', () => {
      const listing: RoleListing = {
        id: 'listing-5' as any,
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

      const event: RoleEvent = {
        id: 'event-6' as any,
        listing: listing,
        eventType: 'Interview',
        eventTitle: 'Final Round',
        eventDate: null,
        eventNotes: null,
      };

      const result = roleEventMapper.toPersistence(event);

      expect(result.eventType).toBe('Interview');
      expect(result.eventTitle).toBe('Final Round');
      expect(result.eventDate).toBe(null);
      expect(result.eventNotes).toBe(null);
    });
  });

  describe('toDomainMany - Batch Operations', () => {
    it('should convert array of DB rows', () => {
      const listingRow1 = db.insert(roleListing).values({
        id: 'listing-6',
        companyId: null,
        title: 'Job 1',
        description: 'Desc 1',
        location: null,
        workArrangement: 'remote',
        capturedAt: 1704067200,
        dataReceivedId: null,
        status: 'not_applied',
        appliedAt: null,
      }).returning().get();

      const listingRow2 = db.insert(roleListing).values({
        id: 'listing-7',
        companyId: null,
        title: 'Job 2',
        description: 'Desc 2',
        location: null,
        workArrangement: 'on-site',
        capturedAt: 1704067200,
        dataReceivedId: null,
        status: 'applied',
        appliedAt: 1704067300,
      }).returning().get();

      const event1 = db.insert(roleEvent).values({
        id: 'event-7',
        eventListingId: 'listing-6',
        eventType: 'Application',
        eventTitle: 'Applied to Job 1',
        eventDate: 1704067300,
        eventNotes: null,
      }).returning().get();

      const event2 = db.insert(roleEvent).values({
        id: 'event-8',
        eventListingId: 'listing-7',
        eventType: 'Interview',
        eventTitle: 'Interview for Job 2',
        eventDate: 1704067400,
        eventNotes: null,
      }).returning().get();

      const results = roleEventMapper.toDomainMany([event1, event2], db);

      expect(results).toHaveLength(2);
      expect(results[0].id).toBe('event-7');
      expect(results[0].listing.title).toBe('Job 1');
      expect(results[1].id).toBe('event-8');
      expect(results[1].listing.title).toBe('Job 2');
    });

    it('should handle empty array', () => {
      const results = roleEventMapper.toDomainMany([], db);

      expect(results).toEqual([]);
    });
  });
});
