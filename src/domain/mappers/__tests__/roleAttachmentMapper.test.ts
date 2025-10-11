import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '@/test-db';
import { roleAttachment, roleListing } from '@/lib/schema';
import * as roleAttachmentMapper from '../roleAttachmentMapper';
let db: ReturnType<typeof createTestDb>['db'];
let rawDb: ReturnType<typeof createTestDb>['rawDb'];
import type { RoleAttachment } from '@/domain/entities/roleAttachment';
import type { RoleListing } from '@/domain/entities/roleListing';

describe('roleAttachmentMapper', () => {
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

      const attachmentRow = db.insert(roleAttachment).values({
        id: 'attachment-1',
        listingId: 'listing-1',
        type: 'document',
        pathOrUrl: '/path/to/resume.pdf',
        createdAt: 1704067200,
      }).returning().get();

      const result = roleAttachmentMapper.toDomain(attachmentRow, db);

      expect(result.id).toBe('attachment-1');
      expect(result.type).toBe('document');
      expect(result.pathOrUrl).toBe('/path/to/resume.pdf');
      expect(result.createdAt).toBe(1704067200);
      expect(result.listing.id).toBe('listing-1');
    });

    it('should throw error when listingId points to non-existent record', () => {
      rawDb.exec('PRAGMA foreign_keys = OFF');
      
      const attachmentRow = db.insert(roleAttachment).values({
        id: 'attachment-2',
        listingId: 'non-existent',
        type: 'link',
        pathOrUrl: 'https://example.com',
        createdAt: 1704067200,
      }).returning().get();

      rawDb.exec('PRAGMA foreign_keys = ON');

      expect(() => roleAttachmentMapper.toDomain(attachmentRow, db)).toThrow('RoleListing not found for id: non-existent');
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

      const attachment: RoleAttachment = {
        id: 'attachment-3' as any,
        listing: listing,
        type: 'note',
        pathOrUrl: null,
        createdAt: 1704067300,
      };

      const result = roleAttachmentMapper.toPersistence(attachment);

      expect(result.listingId).toBe('listing-2');
      expect(result.id).toBe('attachment-3');
      expect(result.type).toBe('note');
      expect(result.pathOrUrl).toBe(null);
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

      const attachment1 = db.insert(roleAttachment).values({
        id: 'attachment-4',
        listingId: 'listing-3',
        type: 'document',
        pathOrUrl: '/resume.pdf',
        createdAt: 1704067200,
      }).returning().get();

      const attachment2 = db.insert(roleAttachment).values({
        id: 'attachment-5',
        listingId: 'listing-3',
        type: 'link',
        pathOrUrl: 'https://portfolio.com',
        createdAt: 1704067300,
      }).returning().get();

      const results = roleAttachmentMapper.toDomainMany([attachment1, attachment2], db);

      expect(results).toHaveLength(2);
      expect(results[0].type).toBe('document');
      expect(results[1].type).toBe('link');
    });

    it('should handle empty array', () => {
      const results = roleAttachmentMapper.toDomainMany([], db);
      expect(results).toEqual([]);
    });
  });
});
