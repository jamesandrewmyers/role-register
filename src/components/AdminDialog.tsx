"use client";

import { useEffect, useState } from "react";
import TableViewer from "./TableViewer";

interface AdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminDialog({ isOpen, onClose }: AdminDialogProps) {
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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

    fetchTables();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl border border-purple-400/30 shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-br from-slate-800 to-purple-900 border-b border-purple-400/30 p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white">Database Admin</h2>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-white text-center">Loading tables...</div>
          ) : (
            <div className="space-y-6">
              {tables.map((table) => (
                <TableViewer key={table} tableName={table} rowLimit={5} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
