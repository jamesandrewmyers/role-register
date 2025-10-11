import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '@/test-db';
import { roleState } from '@/lib/schema';
import * as roleStateMapper from '../roleStateMapper';

let db: ReturnType<typeof createTestDb>['db'];

describe('roleStateMapper', () => {
  beforeEach(() => {
    const testDb = createTestDb();
    db = testDb.db;
  });

  describe('toDomain', () => {
    it('should convert DB row to domain entity', () => {
      const stateRow = db.insert(roleState).values({
        id: 'state-1',
        name: 'California',
        abbreviation: 'CA',
        createdAt: 1704067200,
      }).returning().get();

      const result = roleStateMapper.toDomain(stateRow);

      expect(result.id).toBe('state-1');
      expect(result.name).toBe('California');
      expect(result.abbreviation).toBe('CA');
      expect(result.createdAt).toBe(1704067200);
    });

    it('should handle different states', () => {
      const stateRow = db.insert(roleState).values({
        id: 'state-2',
        name: 'New York',
        abbreviation: 'NY',
        createdAt: 1704067300,
      }).returning().get();

      const result = roleStateMapper.toDomain(stateRow);

      expect(result.name).toBe('New York');
      expect(result.abbreviation).toBe('NY');
    });
  });


  describe('toDomainMany', () => {
    it('should convert array of DB rows', () => {
      const state1 = db.insert(roleState).values({
        id: 'state-4',
        name: 'Oregon',
        abbreviation: 'OR',
        createdAt: 1704067500,
      }).returning().get();

      const state2 = db.insert(roleState).values({
        id: 'state-5',
        name: 'Washington',
        abbreviation: 'WA',
        createdAt: 1704067600,
      }).returning().get();

      const results = roleStateMapper.toDomainMany([state1, state2]);

      expect(results).toHaveLength(2);
      expect(results[0].abbreviation).toBe('OR');
      expect(results[1].abbreviation).toBe('WA');
    });

    it('should handle empty array', () => {
      const results = roleStateMapper.toDomainMany([]);
      expect(results).toEqual([]);
    });
  });
});
