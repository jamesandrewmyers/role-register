import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '@/test-db';
import { eventInfo } from '@/lib/schema';
import * as eventInfoMapper from '../eventInfoMapper';

let db: ReturnType<typeof createTestDb>['db'];

describe('eventInfoMapper', () => {
  beforeEach(() => {
    const testDb = createTestDb();
    db = testDb.db;
  });

  describe('toDomain', () => {
    it('should convert DB row to domain entity with all fields', () => {
      const eventRow = db.insert(eventInfo).values({
        id: 'event-1',
        type: 'data.received',
        payload: '{"url":"https://example.com","title":"Test Job"}',
        status: 'done',
        updatedAt: 1704067300,
        error: null,
        retries: 0,
      }).returning().get();

      const result = eventInfoMapper.toDomain(eventRow);

      expect(result.id).toBe('event-1');
      expect(result.type).toBe('data.received');
      expect(result.payload).toBe('{"url":"https://example.com","title":"Test Job"}');
      expect(result.status).toBe('done');
      expect(result.updatedAt).toBe(1704067300);
      expect(result.error).toBe(null);
      expect(result.retries).toBe(0);
    });

    it('should handle null optional fields', () => {
      const eventRow = db.insert(eventInfo).values({
        id: 'event-2',
        type: 'role.created',
        payload: '{"listingId":"123"}',
        status: 'pending',
        updatedAt: null,
        error: null,
        retries: null,
      }).returning().get();

      const result = eventInfoMapper.toDomain(eventRow);

      expect(result.updatedAt).toBe(null);
      expect(result.error).toBe(null);
      expect(result.retries).toBe(null);
    });

    it('should handle error state', () => {
      const eventRow = db.insert(eventInfo).values({
        id: 'event-3',
        type: 'data.parse',
        payload: '{"raw":"invalid"}',
        status: 'error',
        updatedAt: 1704067400,
        error: 'Failed to parse JSON',
        retries: 3,
      }).returning().get();

      const result = eventInfoMapper.toDomain(eventRow);

      expect(result.status).toBe('error');
      expect(result.error).toBe('Failed to parse JSON');
      expect(result.retries).toBe(3);
    });

    it('should handle complex JSON payloads', () => {
      const complexPayload = JSON.stringify({
        listingId: '123',
        changes: {
          status: 'applied',
          appliedAt: 1704067200,
        },
        metadata: {
          source: 'api',
          version: '1.0',
        },
      });

      const eventRow = db.insert(eventInfo).values({
        id: 'event-4',
        type: 'role.updated',
        payload: complexPayload,
        status: 'done',
        updatedAt: 1704067500,
        error: null,
        retries: 0,
      }).returning().get();

      const result = eventInfoMapper.toDomain(eventRow);

      expect(result.payload).toBe(complexPayload);
    });
  });


  describe('toDomainMany', () => {
    it('should convert array of DB rows', () => {
      const event1 = db.insert(eventInfo).values({
        id: 'event-7',
        type: 'event.one',
        payload: '{"id":1}',
        status: 'done',
        updatedAt: 1704067800,
        error: null,
        retries: 0,
      }).returning().get();

      const event2 = db.insert(eventInfo).values({
        id: 'event-8',
        type: 'event.two',
        payload: '{"id":2}',
        status: 'pending',
        updatedAt: null,
        error: null,
        retries: null,
      }).returning().get();

      const results = eventInfoMapper.toDomainMany([event1, event2]);

      expect(results).toHaveLength(2);
      expect(results[0].type).toBe('event.one');
      expect(results[1].type).toBe('event.two');
    });

    it('should handle empty array', () => {
      const results = eventInfoMapper.toDomainMany([]);
      expect(results).toEqual([]);
    });

    it('should handle multiple events of same type', () => {
      const event1 = db.insert(eventInfo).values({
        id: 'event-9',
        type: 'data.received',
        payload: '{"url":"url1"}',
        status: 'done',
        updatedAt: 1704068000,
        error: null,
        retries: 0,
      }).returning().get();

      const event2 = db.insert(eventInfo).values({
        id: 'event-10',
        type: 'data.received',
        payload: '{"url":"url2"}',
        status: 'done',
        updatedAt: 1704068100,
        error: null,
        retries: 0,
      }).returning().get();

      const results = eventInfoMapper.toDomainMany([event1, event2]);

      expect(results).toHaveLength(2);
      expect(results[0].updatedAt).toBe(1704068000);
      expect(results[1].updatedAt).toBe(1704068100);
    });
  });
});
