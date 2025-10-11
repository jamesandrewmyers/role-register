import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '@/test-db';
import { roleListing, roleCompany, roleLocation, roleState, dataReceived } from '@/lib/schema';
import * as roleListingMapper from '../roleListingMapper';
import type { RoleListing } from '@/domain/entities/roleListing';
import type { RoleCompany } from '@/domain/entities/roleCompany';
import type { RoleLocation } from '@/domain/entities/roleLocation';
import type { DataReceived } from '@/domain/entities/dataReceived';

let db: ReturnType<typeof createTestDb>['db'];
let rawDb: ReturnType<typeof createTestDb>['rawDb'];

describe('roleListingMapper', () => {
  beforeEach(() => {
    const testDb = createTestDb();
    db = testDb.db;
    rawDb = testDb.rawDb;
  });

  describe('toDomain - Happy Path', () => {
    it('should convert DB row to domain entity with all nested objects', () => {
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

      const dataReceivedRow = db.insert(dataReceived).values({
        id: 'data-1',
        url: 'https://linkedin.com/jobs/123',
        title: 'Test Job',
        html: '<html>test</html>',
        text: 'test',
        receivedAt: 1704067200,
      }).returning().get();

      const listingRow = db.insert(roleListing).values({
        id: 'listing-1',
        companyId: 'company-1',
        title: 'Senior Software Engineer',
        description: 'Test description',
        location: 'location-1',
        workArrangement: 'remote',
        capturedAt: 1704067200,
        dataReceivedId: 'data-1',
        status: 'not_applied',
        appliedAt: null,
      }).returning().get();

      const result = roleListingMapper.toDomain(listingRow, db);

      expect(result.id).toBe('listing-1');
      expect(result.title).toBe('Senior Software Engineer');
      expect(result.description).toBe('Test description');
      expect(result.workArrangement).toBe('remote');
      expect(result.capturedAt).toBe(1704067200);
      expect(result.status).toBe('not_applied');
      expect(result.appliedAt).toBe(null);
      
      expect(result.company).not.toBeNull();
      expect(result.company?.id).toBe('company-1');
      expect(result.company?.name).toBe('Test Company');
      expect(result.company?.website).toBe('https://test.com');
      
      expect(result.location).not.toBeNull();
      expect(result.location?.id).toBe('location-1');
      expect(result.location?.city).toBe('Portland');
      expect(result.location?.state.abbreviation).toBe('OR');
      
      expect(result.dataReceived).not.toBeNull();
      expect(result.dataReceived?.id).toBe('data-1');
      expect(result.dataReceived?.url).toBe('https://linkedin.com/jobs/123');
    });

    it('should fetch and nest RoleCompany when companyId exists', () => {
      db.insert(roleCompany).values({
        id: 'company-2',
        name: 'Another Company',
        website: null,
        createdAt: 1704067200,
      }).run();

      const listingRow = db.insert(roleListing).values({
        id: 'listing-2',
        companyId: 'company-2',
        title: 'Backend Engineer',
        description: 'Backend role',
        location: null,
        workArrangement: 'on-site',
        capturedAt: 1704067200,
        dataReceivedId: null,
        status: 'not_applied',
        appliedAt: null,
      }).returning().get();

      const result = roleListingMapper.toDomain(listingRow, db);

      expect(result.company).not.toBeNull();
      expect(result.company?.id).toBe('company-2');
      expect(result.company?.name).toBe('Another Company');
      expect(result.company?.website).toBe(null);
    });

    it('should fetch and nest RoleLocation when location exists', () => {
      const stateRow = db.insert(roleState).values({
        id: 'state-2',
        name: 'Washington',
        abbreviation: 'WA',
        createdAt: 1704067200,
      }).returning().get();

      db.insert(roleLocation).values({
        id: 'location-2',
        locationState: 'state-2',
        city: 'Seattle',
        createdAt: 1704067200,
      }).run();

      const listingRow = db.insert(roleListing).values({
        id: 'listing-3',
        companyId: null,
        title: 'Frontend Engineer',
        description: 'Frontend role',
        location: 'location-2',
        workArrangement: 'hybrid',
        capturedAt: 1704067200,
        dataReceivedId: null,
        status: 'not_applied',
        appliedAt: null,
      }).returning().get();

      const result = roleListingMapper.toDomain(listingRow, db);

      expect(result.location).not.toBeNull();
      expect(result.location?.id).toBe('location-2');
      expect(result.location?.city).toBe('Seattle');
      expect(result.location?.state.name).toBe('Washington');
      expect(result.location?.state.abbreviation).toBe('WA');
    });

    it('should fetch and nest DataReceived when dataReceivedId exists', () => {
      db.insert(dataReceived).values({
        id: 'data-2',
        url: 'https://linkedin.com/jobs/456',
        title: 'Another Job',
        html: '<html>another</html>',
        text: 'another',
        receivedAt: 1704067300,
        processed: 'true',
      }).run();

      const listingRow = db.insert(roleListing).values({
        id: 'listing-4',
        companyId: null,
        title: 'DevOps Engineer',
        description: 'DevOps role',
        location: null,
        workArrangement: 'remote',
        capturedAt: 1704067200,
        dataReceivedId: 'data-2',
        status: 'applied',
        appliedAt: 1704067300,
      }).returning().get();

      const result = roleListingMapper.toDomain(listingRow, db);

      expect(result.dataReceived).not.toBeNull();
      expect(result.dataReceived?.id).toBe('data-2');
      expect(result.dataReceived?.url).toBe('https://linkedin.com/jobs/456');
      expect(result.dataReceived?.processed).toBe('true');
    });
  });

  describe('toDomain - NULL Handling', () => {
    it('should handle null companyId gracefully', () => {
      const listingRow = db.insert(roleListing).values({
        id: 'listing-5',
        companyId: null,
        title: 'Job with no company',
        description: 'Description',
        location: null,
        workArrangement: 'remote',
        capturedAt: 1704067200,
        dataReceivedId: null,
        status: 'not_applied',
        appliedAt: null,
      }).returning().get();

      const result = roleListingMapper.toDomain(listingRow, db);

      expect(result.company).toBe(null);
      expect(result.id).toBe('listing-5');
      expect(result.title).toBe('Job with no company');
    });

    it('should handle null location gracefully', () => {
      const listingRow = db.insert(roleListing).values({
        id: 'listing-6',
        companyId: null,
        title: 'Job with no location',
        description: 'Description',
        location: null,
        workArrangement: 'remote',
        capturedAt: 1704067200,
        dataReceivedId: null,
        status: 'not_applied',
        appliedAt: null,
      }).returning().get();

      const result = roleListingMapper.toDomain(listingRow, db);

      expect(result.location).toBe(null);
      expect(result.id).toBe('listing-6');
      expect(result.title).toBe('Job with no location');
    });

    it('should handle null dataReceivedId gracefully', () => {
      const listingRow = db.insert(roleListing).values({
        id: 'listing-7',
        companyId: null,
        title: 'Job with no data source',
        description: 'Description',
        location: null,
        workArrangement: 'on-site',
        capturedAt: 1704067200,
        dataReceivedId: null,
        status: 'not_applied',
        appliedAt: null,
      }).returning().get();

      const result = roleListingMapper.toDomain(listingRow, db);

      expect(result.dataReceived).toBe(null);
      expect(result.id).toBe('listing-7');
      expect(result.title).toBe('Job with no data source');
    });

    it('should handle missing company row (companyId points to non-existent record)', () => {
      rawDb.exec('PRAGMA foreign_keys = OFF');
      
      const listingRow = db.insert(roleListing).values({
        id: 'listing-8',
        companyId: 'non-existent-company',
        title: 'Job with invalid company reference',
        description: 'Description',
        location: null,
        workArrangement: 'remote',
        capturedAt: 1704067200,
        dataReceivedId: null,
        status: 'not_applied',
        appliedAt: null,
      }).returning().get();

      rawDb.exec('PRAGMA foreign_keys = ON');

      const result = roleListingMapper.toDomain(listingRow, db);

      expect(result.company).toBe(null);
      expect(result.id).toBe('listing-8');
    });

    it('should handle missing location row', () => {
      rawDb.exec('PRAGMA foreign_keys = OFF');
      
      const listingRow = db.insert(roleListing).values({
        id: 'listing-9',
        companyId: null,
        title: 'Job with invalid location reference',
        description: 'Description',
        location: 'non-existent-location',
        workArrangement: 'remote',
        capturedAt: 1704067200,
        dataReceivedId: null,
        status: 'not_applied',
        appliedAt: null,
      }).returning().get();

      rawDb.exec('PRAGMA foreign_keys = ON');

      const result = roleListingMapper.toDomain(listingRow, db);

      expect(result.location).toBe(null);
      expect(result.id).toBe('listing-9');
    });

    it('should handle missing dataReceived row', () => {
      rawDb.exec('PRAGMA foreign_keys = OFF');
      
      const listingRow = db.insert(roleListing).values({
        id: 'listing-10',
        companyId: null,
        title: 'Job with invalid data source reference',
        description: 'Description',
        location: null,
        workArrangement: 'hybrid',
        capturedAt: 1704067200,
        dataReceivedId: 'non-existent-data',
        status: 'not_applied',
        appliedAt: null,
      }).returning().get();

      rawDb.exec('PRAGMA foreign_keys = ON');

      const result = roleListingMapper.toDomain(listingRow, db);

      expect(result.dataReceived).toBe(null);
      expect(result.id).toBe('listing-10');
    });
  });

  describe('toPersistence - ID Extraction', () => {
    it('should extract company.id to companyId field', () => {
      const company: RoleCompany = {
        id: 'company-3' as any,
        name: 'Test Company',
        website: 'https://test.com',
        createdAt: 1704067200,
      };

      const listing: RoleListing = {
        id: 'listing-11' as any,
        company: company,
        title: 'Test Job',
        description: 'Description',
        location: null,
        workArrangement: 'remote',
        capturedAt: 1704067200,
        dataReceived: null,
        status: 'not_applied',
        appliedAt: null,
      };

      const result = roleListingMapper.toPersistence(listing);

      expect(result.companyId).toBe('company-3');
      expect(result.id).toBe('listing-11');
    });

    it('should extract location.id to location field', () => {
      const location: RoleLocation = {
        id: 'location-3' as any,
        state: {
          id: 'state-3' as any,
          name: 'California',
          abbreviation: 'CA',
          createdAt: 1704067200,
        },
        city: 'San Francisco',
        createdAt: 1704067200,
      };

      const listing: RoleListing = {
        id: 'listing-12' as any,
        company: null,
        title: 'Test Job',
        description: 'Description',
        location: location,
        workArrangement: 'hybrid',
        capturedAt: 1704067200,
        dataReceived: null,
        status: 'not_applied',
        appliedAt: null,
      };

      const result = roleListingMapper.toPersistence(listing);

      expect(result.location).toBe('location-3');
      expect(result.id).toBe('listing-12');
    });

    it('should extract dataReceived.id to dataReceivedId field', () => {
      const dataRec: DataReceived = {
        id: 'data-3' as any,
        url: 'https://test.com/job',
        title: 'Test',
        html: '<html></html>',
        text: 'text',
        receivedAt: 1704067200,
        processed: 'true',
        processingNotes: null,
      };

      const listing: RoleListing = {
        id: 'listing-13' as any,
        company: null,
        title: 'Test Job',
        description: 'Description',
        location: null,
        workArrangement: 'on-site',
        capturedAt: 1704067200,
        dataReceived: dataRec,
        status: 'applied',
        appliedAt: 1704067300,
      };

      const result = roleListingMapper.toPersistence(listing);

      expect(result.dataReceivedId).toBe('data-3');
      expect(result.id).toBe('listing-13');
    });

    it('should handle null company by setting companyId to null', () => {
      const listing: RoleListing = {
        id: 'listing-14' as any,
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

      const result = roleListingMapper.toPersistence(listing);

      expect(result.companyId).toBe(null);
    });

    it('should handle null location by setting location to null', () => {
      const listing: RoleListing = {
        id: 'listing-15' as any,
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

      const result = roleListingMapper.toPersistence(listing);

      expect(result.location).toBe(null);
    });

    it('should handle null dataReceived by setting dataReceivedId to null', () => {
      const listing: RoleListing = {
        id: 'listing-16' as any,
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

      const result = roleListingMapper.toPersistence(listing);

      expect(result.dataReceivedId).toBe(null);
    });

    it('should preserve all other entity properties', () => {
      const listing: RoleListing = {
        id: 'listing-17' as any,
        company: null,
        title: 'Full Stack Developer',
        description: 'Work on exciting projects',
        location: null,
        workArrangement: 'hybrid',
        capturedAt: 1704067500,
        dataReceived: null,
        status: 'interviewed',
        appliedAt: 1704067600,
      };

      const result = roleListingMapper.toPersistence(listing);

      expect(result.title).toBe('Full Stack Developer');
      expect(result.description).toBe('Work on exciting projects');
      expect(result.workArrangement).toBe('hybrid');
      expect(result.capturedAt).toBe(1704067500);
      expect(result.status).toBe('interviewed');
      expect(result.appliedAt).toBe(1704067600);
    });
  });

  describe('toDomainMany - Batch Operations', () => {
    it('should convert array of DB rows to domain entities', () => {
      db.insert(roleCompany).values({
        id: 'company-4',
        name: 'Company A',
        website: null,
        createdAt: 1704067200,
      }).run();

      db.insert(roleCompany).values({
        id: 'company-5',
        name: 'Company B',
        website: null,
        createdAt: 1704067200,
      }).run();

      const listing1 = db.insert(roleListing).values({
        id: 'listing-18',
        companyId: 'company-4',
        title: 'Job 1',
        description: 'Desc 1',
        location: null,
        workArrangement: 'remote',
        capturedAt: 1704067200,
        dataReceivedId: null,
        status: 'not_applied',
        appliedAt: null,
      }).returning().get();

      const listing2 = db.insert(roleListing).values({
        id: 'listing-19',
        companyId: 'company-5',
        title: 'Job 2',
        description: 'Desc 2',
        location: null,
        workArrangement: 'on-site',
        capturedAt: 1704067300,
        dataReceivedId: null,
        status: 'applied',
        appliedAt: 1704067400,
      }).returning().get();

      const results = roleListingMapper.toDomainMany([listing1, listing2], db);

      expect(results).toHaveLength(2);
      expect(results[0].id).toBe('listing-18');
      expect(results[0].company?.name).toBe('Company A');
      expect(results[1].id).toBe('listing-19');
      expect(results[1].company?.name).toBe('Company B');
    });

    it('should handle empty array', () => {
      const results = roleListingMapper.toDomainMany([], db);

      expect(results).toEqual([]);
    });

    it('should handle mixed null/non-null foreign keys in batch', () => {
      db.insert(roleCompany).values({
        id: 'company-6',
        name: 'Company C',
        website: null,
        createdAt: 1704067200,
      }).run();

      const listing1 = db.insert(roleListing).values({
        id: 'listing-20',
        companyId: 'company-6',
        title: 'Job with company',
        description: 'Desc',
        location: null,
        workArrangement: 'remote',
        capturedAt: 1704067200,
        dataReceivedId: null,
        status: 'not_applied',
        appliedAt: null,
      }).returning().get();

      const listing2 = db.insert(roleListing).values({
        id: 'listing-21',
        companyId: null,
        title: 'Job without company',
        description: 'Desc',
        location: null,
        workArrangement: 'remote',
        capturedAt: 1704067200,
        dataReceivedId: null,
        status: 'not_applied',
        appliedAt: null,
      }).returning().get();

      const results = roleListingMapper.toDomainMany([listing1, listing2], db);

      expect(results).toHaveLength(2);
      expect(results[0].company).not.toBe(null);
      expect(results[0].company?.name).toBe('Company C');
      expect(results[1].company).toBe(null);
    });
  });
});
