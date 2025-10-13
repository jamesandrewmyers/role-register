import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/schema";
import fs from "fs";
import path from "path";

const DB_PATH_CONFIG = path.resolve(process.cwd(), "data/db_path.json");
const DEFAULT_DB_PATH = path.resolve(process.cwd(), "data/role_register.sqlite");

function loadDatabasePath(): string {
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

let backupInProgress = false;
const writeQueue: Array<() => void> = [];

export function isBackupInProgress(): boolean {
  return backupInProgress;
}

export function pauseWrites(): void {
  backupInProgress = true;
}

export function resumeWrites(): void {
  backupInProgress = false;
  while (writeQueue.length > 0) {
    const fn = writeQueue.shift();
    if (fn) fn();
  }
}

export function runInTransaction<T>(fn: () => T): T {
  if (backupInProgress) {
    throw new Error('Database backup in progress - writes are paused');
  }
  
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
    pauseWrites();
    await rawDb.backup(backupPath);
    console.log('Backup completed successfully');
  } catch (err) {
    console.error('Backup failed:', err);
    throw err;
  } finally {
    resumeWrites();
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
        const displayName = timestamp.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        
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

export async function restoreFromBackup(backupPath: string): Promise<void> {
  try {
    pauseWrites();
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }
    
    const backupDb = new Database(backupPath);
    await backupDb.backup(currentDbPath);
    backupDb.close();
    
    console.log('Restore completed successfully');
  } catch (err) {
    console.error('Restore failed:', err);
    throw err;
  } finally {
    resumeWrites();
  }
}
