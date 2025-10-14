import { performStartupBackup } from './db';
import { isMainThread } from 'worker_threads';

// Only perform startup backup in the main thread, not in worker threads
if (isMainThread) {
  performStartupBackup();
}
