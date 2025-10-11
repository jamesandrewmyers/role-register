import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '@/test-db';
import { roleLocation, roleState } from '@/lib/schema';
import * as roleLocationMapper from '../roleLocationMapper';
import type { RoleLocation } from '@/domain/entities/roleLocation';

let db: ReturnType<typeof createTestDb>['db'];
let rawDb: ReturnType<typeof createTestDb>['rawDb'];

describe('roleLocationMapper', () => {
  beforeEach(() => {
    const testDb = createTestDb();
    db = testDb.db;
    rawDb = testDb.rawDb;
  });

  describe('toDomain', () => {
    it('should fetch and nest RoleState entity', () => {
      const stateRow = db.insert(roleState).values({
        id: 'state-1',
        name: 'California',
        abbreviation: 'CA',
        createdAt: 1704067200,
      }).returning().get();

      const locationRow = db.insert(roleLocation).values({
        id: 'location-1',
        locationState: 'state-1',
        city: 'San Francisco',
        createdAt: 1704067200,
      }).returning().get();

      const result = roleLocationMapper.toDomain(locationRow, db);

      expect(result.id).toBe('location-1');
      expect(result.city).toBe('San Francisco');
      expect(result.createdAt).toBe(1704067200);
      expect(result.state.id).toBe('state-1');
      expect(result.state.name).toBe('California');
      expect(result.state.abbreviation).toBe('CA');
    });

    it('should handle different state and city combinations', () => {
      const stateRow = db.insert(roleState).values({
        id: 'state-2',
        name: 'New York',
        abbreviation: 'NY',
        createdAt: 1704067200,
      }).returning().get();

      const locationRow = db.insert(roleLocation).values({
        id: 'location-2',
        locationState: 'state-2',
        city: 'Brooklyn',
        createdAt: 1704067300,
      }).returning().get();

      const result = roleLocationMapper.toDomain(locationRow, db);

      expect(result.city).toBe('Brooklyn');
      expect(result.state.name).toBe('New York');
      expect(result.state.abbreviation).toBe('NY');
    });

    it('should throw error when locationState points to non-existent record', () => {
      rawDb.exec('PRAGMA foreign_keys = OFF');
      
      const locationRow = db.insert(roleLocation).values({
        id: 'location-3',
        locationState: 'non-existent',
        city: 'Ghost Town',
        createdAt: 1704067400,
      }).returning().get();

      rawDb.exec('PRAGMA foreign_keys = ON');

      expect(() => roleLocationMapper.toDomain(locationRow, db)).toThrow('RoleState not found for id: non-existent');
    });
  });

  describe('toPersistence', () => {
    it('should extract state.id to locationState field', () => {
      const location: RoleLocation = {
        id: 'location-4' as any,
        state: {
          id: 'state-3' as any,
          name: 'Texas',
          abbreviation: 'TX',
          createdAt: 1704067500,
        },
        city: 'Austin',
        createdAt: 1704067600,
      };

      const result = roleLocationMapper.toPersistence(location);

      expect(result.id).toBe('location-4');
      expect(result.locationState).toBe('state-3');
      expect(result.city).toBe('Austin');
      expect(result.createdAt).toBe(1704067600);
    });

    it('should preserve all location properties', () => {
      const location: RoleLocation = {
        id: 'location-5' as any,
        state: {
          id: 'state-4' as any,
          name: 'Oregon',
          abbreviation: 'OR',
          createdAt: 1704067700,
        },
        city: 'Portland',
        createdAt: 1704067800,
      };

      const result = roleLocationMapper.toPersistence(location);

      expect(result.city).toBe('Portland');
      expect(result.createdAt).toBe(1704067800);
    });
  });

  describe('toDomainMany', () => {
    it('should convert array of DB rows', () => {
      const state1 = db.insert(roleState).values({
        id: 'state-5',
        name: 'Washington',
        abbreviation: 'WA',
        createdAt: 1704067900,
      }).returning().get();

      const state2 = db.insert(roleState).values({
        id: 'state-6',
        name: 'Colorado',
        abbreviation: 'CO',
        createdAt: 1704068000,
      }).returning().get();

      const location1 = db.insert(roleLocation).values({
        id: 'location-6',
        locationState: 'state-5',
        city: 'Seattle',
        createdAt: 1704068100,
      }).returning().get();

      const location2 = db.insert(roleLocation).values({
        id: 'location-7',
        locationState: 'state-6',
        city: 'Denver',
        createdAt: 1704068200,
      }).returning().get();

      const results = roleLocationMapper.toDomainMany([location1, location2], db);

      expect(results).toHaveLength(2);
      expect(results[0].city).toBe('Seattle');
      expect(results[0].state.abbreviation).toBe('WA');
      expect(results[1].city).toBe('Denver');
      expect(results[1].state.abbreviation).toBe('CO');
    });

    it('should handle empty array', () => {
      const results = roleLocationMapper.toDomainMany([], db);
      expect(results).toEqual([]);
    });

    it('should handle multiple locations in same state', () => {
      const state = db.insert(roleState).values({
        id: 'state-7',
        name: 'California',
        abbreviation: 'CA',
        createdAt: 1704068300,
      }).returning().get();

      const location1 = db.insert(roleLocation).values({
        id: 'location-8',
        locationState: 'state-7',
        city: 'Los Angeles',
        createdAt: 1704068400,
      }).returning().get();

      const location2 = db.insert(roleLocation).values({
        id: 'location-9',
        locationState: 'state-7',
        city: 'San Diego',
        createdAt: 1704068500,
      }).returning().get();

      const results = roleLocationMapper.toDomainMany([location1, location2], db);

      expect(results).toHaveLength(2);
      expect(results[0].city).toBe('Los Angeles');
      expect(results[1].city).toBe('San Diego');
      expect(results[0].state.id).toBe(results[1].state.id);
    });
  });
});
