"use client";

import { useEffect, useState } from "react";
import TableViewer from "./TableViewer";

interface AdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "settings" | "actions" | "database";

export default function AdminDialog({ isOpen, onClose }: AdminDialogProps) {
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("settings");
  const [reprocessing, setReprocessing] = useState(false);
  const [storageLocation, setStorageLocation] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;

    async function fetchTables() {
      try {
        const res = await fetch("/api/admin/tables");
        const data = await res.json();
        setTables(data.tables || []);
      } catch (error) {
        console.error("Failed to fetch tables:", error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings/storage_location");
        if (res.ok) {
          const data = await res.json();
          setStorageLocation(data.value || "");
        }
      } catch (error) {
        console.log("No storage_location setting found yet");
      }
    }

    fetchTables();
    fetchSettings();
  }, [isOpen]);

  const handleFolderSelect = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).electron) {
        const result = await (window as any).electron.selectFolder();
        if (result && !result.canceled && result.filePaths.length > 0) {
          const folderPath = result.filePaths[0];
          setStorageLocation(folderPath);
          
          await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "storage_location",
              value: folderPath
            })
          });
        }
      } else {
        alert("This feature requires running the application in Electron. Use 'npm run electron:dev' to start.");
      }
    } catch (error) {
      console.error("Error selecting folder:", error);
    }
  };

  const handleReprocessAll = async () => {
    const confirmed = confirm("Are you sure you want to reprocess all imported listing data? This will create reprocessing events for all data_received records.");
    
    if (!confirmed) {
      return;
    }

    setReprocessing(true);
    try {
      const response = await fetch("/api/dashboard");
      const data = await response.json();
      const dataReceivedItems = data.dataReceived || [];

      for (const item of dataReceivedItems) {
        await fetch("/api/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "processHtml",
            payload: {
              dataReceivedId: item.id,
              url: item.url,
              title: item.title
            }
          })
        });
      }

      alert(`Created ${dataReceivedItems.length} reprocessing events`);
    } catch (error) {
      console.error("Reprocessing error:", error);
      alert("Failed to trigger reprocessing");
    } finally {
      setReprocessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl border border-purple-400/30 shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col mt-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-br from-slate-800 to-purple-900 border-b border-purple-400/30 p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white">Admin</h2>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="border-b border-purple-400/30">
          <div className="flex gap-2 px-6">
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === "settings"
                  ? "text-white border-b-2 border-purple-400"
                  : "text-purple-300 hover:text-white"
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab("actions")}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === "actions"
                  ? "text-white border-b-2 border-purple-400"
                  : "text-purple-300 hover:text-white"
              }`}
            >
              Actions
            </button>
            <button
              onClick={() => setActiveTab("database")}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === "database"
                  ? "text-white border-b-2 border-purple-400"
                  : "text-purple-300 hover:text-white"
              }`}
            >
              Database
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "settings" && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-white font-semibold mb-4">Storage Location</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Select a folder on your local filesystem to store application data
                </p>
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={storageLocation}
                    readOnly
                    placeholder="No folder selected"
                    className="flex-1 bg-black/20 border border-purple-400/30 rounded-lg px-4 py-2 text-white placeholder-gray-500"
                  />
                  <button
                    onClick={handleFolderSelect}
                    className="px-6 py-2 bg-purple-500/30 hover:bg-purple-500/50 rounded-lg border border-purple-400/30 text-white font-semibold transition-colors"
                  >
                    Browse
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "actions" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/5 rounded-lg p-4 border border-white/10">
                <button
                  onClick={handleReprocessAll}
                  disabled={reprocessing}
                  className="p-3 bg-purple-500/30 hover:bg-purple-500/50 rounded-lg border border-purple-400/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Reprocess all"
                >
                  <svg
                    className={`w-6 h-6 text-purple-300 ${reprocessing ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">Reprocess all imported listing data</h3>
                  <p className="text-gray-400 text-sm">Creates reprocessing events for all data_received records</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "database" && (
            <>
              {loading ? (
                <div className="text-white text-center">Loading tables...</div>
              ) : (
                <div className="space-y-6">
                  {tables.map((table) => (
                    <TableViewer key={table} tableName={table} rowLimit={5} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
