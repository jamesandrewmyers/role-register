import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/schema";
import { sql } from "drizzle-orm";

export function createTestDb() {
  const sqlite = new Database(":memory:");
  const db = drizzle(sqlite, { schema });

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS event_info (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      updated_at INTEGER,
      error TEXT,
      retries INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS data_received (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      html TEXT NOT NULL,
      text TEXT NOT NULL,
      received_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      processed TEXT DEFAULT 'false',
      processing_notes TEXT
    );

    CREATE TABLE IF NOT EXISTS role_company (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      website TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS role_state (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      abbreviation TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS role_location (
      id TEXT PRIMARY KEY,
      location_state TEXT NOT NULL REFERENCES role_state(id) ON DELETE CASCADE,
      city TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS role_listing (
      id TEXT PRIMARY KEY,
      company_id TEXT REFERENCES role_company(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT REFERENCES role_location(id) ON DELETE SET NULL,
      work_arrangement TEXT NOT NULL DEFAULT 'on-site',
      captured_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      data_received_id TEXT REFERENCES data_received(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'not_applied',
      applied_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS role_callout (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL REFERENCES role_listing(id) ON DELETE CASCADE,
      content TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS role_attachment (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL REFERENCES role_listing(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      path_or_url TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS role_contact (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL REFERENCES role_listing(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT
    );

    CREATE TABLE IF NOT EXISTS role_event (
      id TEXT PRIMARY KEY,
      event_listing_id TEXT NOT NULL REFERENCES role_listing(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      event_title TEXT NOT NULL,
      event_date INTEGER,
      event_notes TEXT
    );

    CREATE TABLE IF NOT EXISTS role_qualifications (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL REFERENCES role_listing(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS value_mapping (
      id TEXT PRIMARY KEY,
      value_name TEXT NOT NULL,
      value_source TEXT NOT NULL,
      value_type TEXT NOT NULL,
      value_entity TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );

    PRAGMA foreign_keys = ON;
  `);

  return { db, rawDb: sqlite };
}
