import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/schema";
import fs from "fs";
import path from "path";

const DB_PATH_CONFIG = path.resolve(process.cwd(), "data/db_path.json");
const DEFAULT_DB_PATH = path.resolve(process.cwd(), "data/role_register.sqlite");

function loadDatabasePath(): string {
  // Check for environment variable first
  if (process.env.DATABASE_PATH) {
    const envPath = path.resolve(process.cwd(), process.env.DATABASE_PATH);
    console.log(`[DB] Using database path from DATABASE_PATH env var: ${envPath}`);
    return envPath;
  }
  
  // Fall back to config file
  try {
    if (fs.existsSync(DB_PATH_CONFIG)) {
      const config = JSON.parse(fs.readFileSync(DB_PATH_CONFIG, "utf-8"));
      return config.path || DEFAULT_DB_PATH;
    }
  } catch (err) {
    console.error("Failed to load database path config:", err);
  }
  return DEFAULT_DB_PATH;
}

function saveDatabasePath(dbPath: string): void {
  const configDir = path.dirname(DB_PATH_CONFIG);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  fs.writeFileSync(DB_PATH_CONFIG, JSON.stringify({ path: dbPath }, null, 2));
}

function createConnection(dbPath: string) {
  // Verify file exists
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database file not found: ${dbPath}`);
  }
  
  const sqlite = new Database(dbPath);
  
  // Enable WAL mode for crash protection
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('synchronous = NORMAL');
  
  const db = drizzle(sqlite, { schema });
  
  // Test connection
  try {
    sqlite.prepare('SELECT 1').get();
  } catch (err) {
    sqlite.close();
    throw new Error(`Failed to connect to database: ${err}`);
  }
  
  return { sqlite, db };
}

// Initialize connection
let currentDbPath = loadDatabasePath();
let connection = createConnection(currentDbPath);

export let db = connection.db;
export let rawDb = connection.sqlite;

export function getCurrentDatabasePath(): string {
  return currentDbPath;
}

export function reconnectDatabase(newDbPath: string): void {
  const absolutePath = path.resolve(newDbPath);
  
  // Verify new database exists
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Database file not found: ${absolutePath}`);
  }
  
  // Close old connection
  try {
    rawDb.close();
  } catch (err) {
    console.error("Error closing old database connection:", err);
  }
  
  // Create new connection
  connection = createConnection(absolutePath);
  db = connection.db;
  rawDb = connection.sqlite;
  currentDbPath = absolutePath;
  
  // Save new path to config
  saveDatabasePath(absolutePath);
  
  console.log(`✅ Database reconnected to: ${absolutePath}`);
}

export function runInTransaction<T>(fn: () => T): T {
  try {
    const transaction = rawDb.transaction(fn);
    return transaction();
  } catch (err: any) {
    if (err.message?.includes('readonly database') || err.message?.includes('disk I/O error')) {
      throw new Error('Database connection error - database may have been moved or is readonly');
    }
    throw err;
  }
}

export async function performBackup(backupPath: string): Promise<void> {
  try {
    // Checkpoint WAL to ensure all changes are in the main database file
    rawDb.pragma('wal_checkpoint(FULL)');
    
    // SQLite backup API handles locking and coordination internally
    await rawDb.backup(backupPath);
    console.log('Backup completed successfully');
  } catch (err) {
    console.error('Backup failed:', err);
    throw err;
  }
}

export interface BackupInfo {
  fileName: string;
  fullPath: string;
  timestamp: Date;
  displayName: string;
}

export function listBackups(): BackupInfo[] {
  const dbDir = path.dirname(currentDbPath);
  const dbFileName = path.basename(currentDbPath, '.sqlite');
  
  if (!fs.existsSync(dbDir)) {
    return [];
  }
  
  const files = fs.readdirSync(dbDir);
  const backupFiles = files
    .filter(file => file.match(/_backup_(\d{4})\-(\d{2})\-(\d{2})T(\d{2})\-(\d{2})\-(\d{2}).*\.sqlite$/))
    .map(fileName => {
      const fullPath = path.join(dbDir, fileName);
      const tsm = fileName.match(/_backup_(\d{4})\-(\d{2})\-(\d{2})T(\d{2})\-(\d{2})\-(\d{2}).*\.sqlite$/);
      
      if (tsm) {
        let timestamp = new Date(`${tsm[1]}-${tsm[2]}-${tsm[3]}T${tsm[4]}:${tsm[5]}:${tsm[6]}.000Z`);
        const displayName = timestamp.toISOString();
        
        return {
          fileName,
          fullPath,
          timestamp,
          displayName
        };
      }
      return {} as BackupInfo;
 
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  return backupFiles;
}

export function getMostRecentBackup(): BackupInfo | null {
  const backups = listBackups();
  return backups.length > 0 ? backups[0] : null;
}

export function databaseNeedsBackup(): boolean {
  const mostRecent = getMostRecentBackup();
  
  if (!mostRecent) {
    console.log('[Startup Backup] No existing backups found, backup needed');
    return true;
  }
  
  // Check if database was modified after the backup was created
  if (!fs.existsSync(currentDbPath)) {
    console.log('[Startup Backup] Database file not found, backup needed');
    return true;
  }
  
  const dbStats = fs.statSync(currentDbPath);
  const dbModifiedMs = dbStats.mtimeMs;
  const walStats = fs.statSync(currentDbPath + '-wal');
  const walModifiedMs = walStats.mtimeMs;
  const backupStats = fs.statSync(mostRecent.fullPath);
  const backupModifiedMs = backupStats.mtimeMs;
  
  if (dbModifiedMs > backupModifiedMs
  || walModifiedMs > backupModifiedMs) {
    console.log('[Startup Backup] Database modified after most recent backup, backup needed');
    console.log(`  DB mtime: ${new Date(dbModifiedMs).toISOString()}`);
    console.log(`  WAL mtime: ${new Date(walModifiedMs).toISOString()}`);
    console.log(`  Backup mtime: ${new Date(backupModifiedMs).toISOString()}`);
    return true;
  }
  
  console.log('[Startup Backup] Database not modified since most recent backup, no backup needed');
  return false;
}

export async function restoreFromBackup(backupPath: string): Promise<void> {
  try {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }
    
    // Workers should be terminated before calling this function
    // SQLite backup API handles locking and coordination internally
    const backupDb = new Database(backupPath);
    await backupDb.backup(currentDbPath);
    backupDb.close();
    
    console.log('Restore completed successfully');
  } catch (err) {
    console.error('Restore failed:', err);
    throw err;
  }
}

// Export function to perform startup backup - should only be called from main process
export async function performStartupBackup(): Promise<void> {
  try {
    if (databaseNeedsBackup()) {
      console.log('[Startup Backup] Creating automatic backup...');
      
      const dbDir = path.dirname(currentDbPath);
      const dbFileName = path.basename(currentDbPath, '.sqlite');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `${dbFileName}_backup_${timestamp}.sqlite`;
      const backupPath = path.join(dbDir, backupFileName);
      
      await performBackup(backupPath);
      console.log('[Startup Backup] Automatic backup created successfully');
    }
  } catch (err) {
    console.error('[Startup Backup] Failed to create automatic backup:', err);
  }
}

// Export function to perform periodic backup check
export async function performPeriodicBackupCheck(): Promise<void> {
  try {
    if (databaseNeedsBackup()) {
      console.log('[Periodic Backup] Creating automatic backup...');
      
      const dbDir = path.dirname(currentDbPath);
      const dbFileName = path.basename(currentDbPath, '.sqlite');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `${dbFileName}_backup_${timestamp}.sqlite`;
      const backupPath = path.join(dbDir, backupFileName);
      
      await performBackup(backupPath);
      console.log('[Periodic Backup] Automatic backup created successfully');
    }
  } catch (err) {
    console.error('[Periodic Backup] Failed to create automatic backup:', err);
  }
}
