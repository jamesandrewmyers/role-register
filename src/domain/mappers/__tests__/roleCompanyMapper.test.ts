import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from '@/test-db';
import { roleCompany } from '@/lib/schema';
import * as roleCompanyMapper from '../roleCompanyMapper';

let db: ReturnType<typeof createTestDb>['db'];

describe('roleCompanyMapper', () => {
  beforeEach(() => {
    const testDb = createTestDb();
    db = testDb.db;
  });

  describe('toDomain', () => {
    it('should convert DB row to domain entity with all fields', () => {
      const companyRow = db.insert(roleCompany).values({
        id: 'company-1',
        name: 'Acme Corporation',
        website: 'https://acme.com',
        createdAt: 1704067200,
      }).returning().get();

      const result = roleCompanyMapper.toDomain(companyRow);

      expect(result.id).toBe('company-1');
      expect(result.name).toBe('Acme Corporation');
      expect(result.website).toBe('https://acme.com');
      expect(result.createdAt).toBe(1704067200);
    });

    it('should handle null website field', () => {
      const companyRow = db.insert(roleCompany).values({
        id: 'company-2',
        name: 'Startup Inc',
        website: null,
        createdAt: 1704067300,
      }).returning().get();

      const result = roleCompanyMapper.toDomain(companyRow);

      expect(result.id).toBe('company-2');
      expect(result.name).toBe('Startup Inc');
      expect(result.website).toBe(null);
      expect(result.createdAt).toBe(1704067300);
    });
  });


  describe('toDomainMany', () => {
    it('should convert array of DB rows', () => {
      const company1 = db.insert(roleCompany).values({
        id: 'company-5',
        name: 'Company One',
        website: 'https://one.com',
        createdAt: 1704067600,
      }).returning().get();

      const company2 = db.insert(roleCompany).values({
        id: 'company-6',
        name: 'Company Two',
        website: null,
        createdAt: 1704067700,
      }).returning().get();

      const results = roleCompanyMapper.toDomainMany([company1, company2]);

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Company One');
      expect(results[1].name).toBe('Company Two');
    });

    it('should handle empty array', () => {
      const results = roleCompanyMapper.toDomainMany([]);
      expect(results).toEqual([]);
    });
  });
});
