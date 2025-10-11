import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '@/test-db';
import { settings } from '@/lib/schema';
import * as settingsMapper from '../settingsMapper';

let db: ReturnType<typeof createTestDb>['db'];

describe('settingsMapper', () => {
  beforeEach(() => {
    const testDb = createTestDb();
    db = testDb.db;
  });

  describe('toDomain', () => {
    it('should convert DB row to domain entity', () => {
      const settingRow = db.insert(settings).values({
        id: 'setting-1',
        name: 'api_key',
        value: 'sk-1234567890',
        updatedAt: 1704067200,
      }).returning().get();

      const result = settingsMapper.toDomain(settingRow);

      expect(result.id).toBe('setting-1');
      expect(result.name).toBe('api_key');
      expect(result.value).toBe('sk-1234567890');
      expect(result.updatedAt).toBe(1704067200);
    });

    it('should handle different setting types', () => {
      const settingRow = db.insert(settings).values({
        id: 'setting-2',
        name: 'max_results',
        value: '100',
        updatedAt: 1704067300,
      }).returning().get();

      const result = settingsMapper.toDomain(settingRow);

      expect(result.name).toBe('max_results');
      expect(result.value).toBe('100');
    });

    it('should handle empty string values', () => {
      const settingRow = db.insert(settings).values({
        id: 'setting-3',
        name: 'optional_config',
        value: '',
        updatedAt: 1704067400,
      }).returning().get();

      const result = settingsMapper.toDomain(settingRow);

      expect(result.value).toBe('');
    });
  });


  describe('toDomainMany', () => {
    it('should convert array of DB rows', () => {
      const setting1 = db.insert(settings).values({
        id: 'setting-4',
        name: 'setting1',
        value: 'value1',
        updatedAt: 1704067500,
      }).returning().get();

      const setting2 = db.insert(settings).values({
        id: 'setting-5',
        name: 'setting2',
        value: 'value2',
        updatedAt: 1704067600,
      }).returning().get();

      const results = settingsMapper.toDomainMany([setting1, setting2]);

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('setting1');
      expect(results[1].name).toBe('setting2');
    });

    it('should handle empty array', () => {
      const results = settingsMapper.toDomainMany([]);
      expect(results).toEqual([]);
    });
  });
});
