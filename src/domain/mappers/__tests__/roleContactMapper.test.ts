import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '@/test-db';
import { roleContact, roleListing } from '@/lib/schema';
import * as roleContactMapper from '../roleContactMapper';
let db: ReturnType<typeof createTestDb>['db'];
let rawDb: ReturnType<typeof createTestDb>['rawDb'];
import type { RoleContact } from '@/domain/entities/roleContact';
import type { RoleListing } from '@/domain/entities/roleListing';

describe('roleContactMapper', () => {
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

      const contactRow = db.insert(roleContact).values({
        id: 'contact-1',
        listingId: 'listing-1',
        name: 'John Recruiter',
        email: 'john@company.com',
        phone: '555-1234',
      }).returning().get();

      const result = roleContactMapper.toDomain(contactRow, db);

      expect(result.id).toBe('contact-1');
      expect(result.name).toBe('John Recruiter');
      expect(result.email).toBe('john@company.com');
      expect(result.phone).toBe('555-1234');
      expect(result.listing.id).toBe('listing-1');
    });

    it('should throw error when listingId points to non-existent record', () => {
      rawDb.exec('PRAGMA foreign_keys = OFF');
      
      const contactRow = db.insert(roleContact).values({
        id: 'contact-2',
        listingId: 'non-existent',
        name: 'Test Contact',
        email: null,
        phone: null,
      }).returning().get();

      rawDb.exec('PRAGMA foreign_keys = ON');

      expect(() => roleContactMapper.toDomain(contactRow, db)).toThrow('RoleListing not found for id: non-existent');
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

      const contact: RoleContact = {
        id: 'contact-3' as any,
        listing: listing,
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: null,
      };

      const result = roleContactMapper.toPersistence(contact);

      expect(result.listingId).toBe('listing-2');
      expect(result.id).toBe('contact-3');
      expect(result.name).toBe('Jane Doe');
      expect(result.email).toBe('jane@example.com');
      expect(result.phone).toBe(null);
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

      const contact1 = db.insert(roleContact).values({
        id: 'contact-4',
        listingId: 'listing-3',
        name: 'Contact 1',
        email: 'c1@test.com',
        phone: null,
      }).returning().get();

      const contact2 = db.insert(roleContact).values({
        id: 'contact-5',
        listingId: 'listing-3',
        name: 'Contact 2',
        email: null,
        phone: '555-5555',
      }).returning().get();

      const results = roleContactMapper.toDomainMany([contact1, contact2], db);

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Contact 1');
      expect(results[1].name).toBe('Contact 2');
    });

    it('should handle empty array', () => {
      const results = roleContactMapper.toDomainMany([], db);
      expect(results).toEqual([]);
    });
  });
});
