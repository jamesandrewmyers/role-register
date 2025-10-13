"use client";

import { useEffect, useState } from "react";

interface BackupInfo {
  fileName: string;
  fullPath: string;
  displayName: string;
  timestamp: string;
}

interface RestoreBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: () => void;
}

export default function RestoreBackupModal({ isOpen, onClose, onRestore }: RestoreBackupModalProps) {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchBackups() {
      try {
        const res = await fetch("/api/admin/list-backups");
        const data = await res.json();
        if (data.success) {
          setBackups(data.backups || []);
          if (data.backups && data.backups.length > 0) {
            setSelectedBackup(data.backups[0].fullPath);
          }
        }
      } catch (error) {
        console.error("Failed to fetch backups:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBackups();
  }, [isOpen]);

  const handleRestore = async () => {
    if (!selectedBackup) {
      alert("Please select a backup to restore");
      return;
    }

    setRestoring(true);
    try {
      const response = await fetch("/api/admin/restore-backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backupPath: selectedBackup })
      });

      const data = await response.json();

      if (data.success) {
        alert("Database restored successfully!");
        onRestore();
        onClose();
      } else {
        alert(`Restore failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Restore error:", error);
      alert("Failed to restore backup");
    } finally {
      setRestoring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl border border-purple-400/30 shadow-2xl w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold text-white mb-4">Restore from Backup</h3>

        {loading ? (
          <div className="text-white text-center py-8">Loading backups...</div>
        ) : backups.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No backups found. Create a backup first.
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">
                Select backup to restore:
              </label>
              <select
                value={selectedBackup}
                onChange={(e) => setSelectedBackup(e.target.value)}
                className="w-full bg-black/20 border border-purple-400/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400"
                disabled={restoring}
              >
                {backups.map((backup) => (
                  <option key={backup.fullPath} value={backup.fullPath}>
                    {backup.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <p className="text-yellow-300 text-sm">
                ⚠️ Warning: This will replace the current database with the selected backup.
                All current data will be overwritten. This action cannot be undone.
              </p>
            </div>
          </>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={restoring}
            className="px-6 py-2 bg-gray-600/50 hover:bg-gray-600/70 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          {backups.length > 0 && (
            <button
              onClick={handleRestore}
              disabled={restoring || !selectedBackup}
              className="px-6 py-2 bg-purple-500/30 hover:bg-purple-500/50 rounded-lg border border-purple-400/30 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {restoring ? "Restoring..." : "Restore"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
