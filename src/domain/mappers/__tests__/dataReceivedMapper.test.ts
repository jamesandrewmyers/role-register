import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '@/test-db';
import { dataReceived } from '@/lib/schema';
import * as dataReceivedMapper from '../dataReceivedMapper';

let db: ReturnType<typeof createTestDb>['db'];

describe('dataReceivedMapper', () => {
  beforeEach(() => {
    const testDb = createTestDb();
    db = testDb.db;
  });

  describe('toDomain', () => {
    it('should convert DB row to domain entity with all fields', () => {
      const receivedRow = db.insert(dataReceived).values({
        id: 'data-1',
        url: 'https://linkedin.com/jobs/123',
        title: 'Software Engineer',
        receivedAt: 1704067200,
        processed: 'yes',
        processingNotes: 'Successfully extracted',
        html: '<html>content</html>',
        text: 'Job description',
      }).returning().get();

      const result = dataReceivedMapper.toDomain(receivedRow);

      expect(result.id).toBe('data-1');
      expect(result.url).toBe('https://linkedin.com/jobs/123');
      expect(result.title).toBe('Software Engineer');
      expect(result.receivedAt).toBe(1704067200);
      expect(result.processed).toBe('yes');
      expect(result.processingNotes).toBe('Successfully extracted');
      expect(result.html).toBe('<html>content</html>');
      expect(result.text).toBe('Job description');
    });

    it('should handle null processing notes', () => {
      const receivedRow = db.insert(dataReceived).values({
        id: 'data-2',
        url: 'https://indeed.com/job/456',
        title: 'Data Scientist',
        receivedAt: 1704067300,
        processed: 'no',
        processingNotes: null,
        html: '<html>content</html>',
        text: 'Job description',
      }).returning().get();

      const result = dataReceivedMapper.toDomain(receivedRow);

      expect(result.processingNotes).toBe(null);
    });

    it('should handle error processing state', () => {
      const receivedRow = db.insert(dataReceived).values({
        id: 'data-3',
        url: 'https://example.com/job',
        title: 'Product Manager',
        receivedAt: 1704067400,
        processed: 'error',
        processingNotes: 'Failed to parse HTML',
        html: '<html>invalid</html>',
        text: 'Partial text',
      }).returning().get();

      const result = dataReceivedMapper.toDomain(receivedRow);

      expect(result.processed).toBe('error');
      expect(result.processingNotes).toBe('Failed to parse HTML');
    });
  });

  describe('toDomainMany', () => {
    it('should convert array of DB rows', () => {
      const received1 = db.insert(dataReceived).values({
        id: 'data-6',
        url: 'https://job1.com',
        title: 'Job 1',
        receivedAt: 1704067700,
        processed: 'yes',
        processingNotes: 'OK',
        html: '<html>1</html>',
        text: 'Text 1',
      }).returning().get();

      const received2 = db.insert(dataReceived).values({
        id: 'data-7',
        url: 'https://job2.com',
        title: 'Job 2',
        receivedAt: 1704067800,
        processed: 'no',
        processingNotes: null,
        html: '<html>2</html>',
        text: 'Text 2',
      }).returning().get();

      const results = dataReceivedMapper.toDomainMany([received1, received2]);

      expect(results).toHaveLength(2);
      expect(results[0].title).toBe('Job 1');
      expect(results[1].title).toBe('Job 2');
    });

    it('should handle empty array', () => {
      const results = dataReceivedMapper.toDomainMany([]);
      expect(results).toEqual([]);
    });
  });
});
