// lib/db.ts
import Database from "better-sqlite3";

const db = new Database("app.db");

// Ensure table exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    createdAt TEXT
  )
`).run();

export default db;
