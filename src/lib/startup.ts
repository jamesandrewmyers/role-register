import { performStartupBackup, performPeriodicBackupCheck } from './db';
import { getSettingByName } from '@/services/settingsService';
import { isMainThread } from 'worker_threads';

// Default backup interval: 15 minutes (in milliseconds)
const DEFAULT_BACKUP_INTERVAL_MS = 15 * 60 * 1000;

let periodicBackupInterval: NodeJS.Timeout | null = null;

function getBackupIntervalMs(): number {
  try {
    const setting = getSettingByName('backup_interval_minutes');
    if (setting && setting.value) {
      const minutes = parseInt(setting.value, 10);
      if (!isNaN(minutes) && minutes > 0) {
        console.log(`[Periodic Backup] Using configured interval: ${minutes} minutes`);
        return minutes * 60 * 1000;
      }
    }
  } catch (err) {
    console.error('[Periodic Backup] Failed to read backup interval setting:', err);
  }
  
  console.log(`[Periodic Backup] Using default interval: ${DEFAULT_BACKUP_INTERVAL_MS / 60000} minutes`);
  return DEFAULT_BACKUP_INTERVAL_MS;
}

// Only perform startup backup and periodic checks in the main thread, not in worker threads
if (isMainThread) {
  // Perform initial startup backup
  performStartupBackup().then(() => {
    // Start periodic backup checks after startup completes
    const intervalMs = getBackupIntervalMs();
    
    periodicBackupInterval = setInterval(() => {
      performPeriodicBackupCheck();
    }, intervalMs);

    console.log(`[Periodic Backup] Scheduled to run every ${intervalMs / 60000} minutes`);
  });

  // Cleanup on process termination
  const cleanup = () => {
    if (periodicBackupInterval) {
      clearInterval(periodicBackupInterval);
      console.log('[Periodic Backup] Interval cleared');
    }
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}
