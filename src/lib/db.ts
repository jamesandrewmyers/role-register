import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/schema";

// Point to dev database (for dev put it under /data)
const sqlite = new Database("data/role_register.sqlite");

// Wrap with Drizzle
export const db = drizzle(sqlite, { schema });

// Export raw SQLite connection for direct queries
export const rawDb = sqlite;
