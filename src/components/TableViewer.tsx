"use client";

import { useEffect, useState } from "react";

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
}

interface TableViewerProps {
  tableName: string;
  rowLimit?: number;
}

export default function TableViewer({ tableName, rowLimit = 10 }: TableViewerProps) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTableData() {
      try {
        const res = await fetch(
          `/api/admin/table-data?table=${encodeURIComponent(tableName)}&limit=${rowLimit}`
        );
        const data = await res.json();
        setColumns(data.columns || []);
        setRows(data.rows || []);
      } catch (error) {
        console.error("Failed to fetch table data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTableData();
  }, [tableName, rowLimit]);

  const renderValue = (value: any, columnName: string) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-500 italic">null</span>;
    }

    const stringValue = String(value);
    const isTruncated = stringValue.length > 50;

    return (
      <div
        className={isTruncated ? "cursor-pointer hover:text-purple-300" : ""}
        onClick={() => isTruncated && setSelectedValue(stringValue)}
      >
        {isTruncated ? stringValue.substring(0, 50) + "..." : stringValue}
      </div>
    );
  };

  const renderValueDialog = () => {
    if (!selectedValue) return null;

    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedValue(null)}
      >
        <div
          className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl border border-purple-400/30 shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-gradient-to-br from-slate-800 to-purple-900 border-b border-purple-400/30 p-6 flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">Full Value</h3>
            <button
              onClick={() => setSelectedValue(null)}
              className="text-purple-300 hover:text-white transition-colors text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="p-6">
            <div className="text-white font-mono text-sm bg-black/20 p-4 rounded overflow-x-auto whitespace-pre-wrap break-words">
              {selectedValue}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="text-purple-300 text-sm">Loading {tableName}...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
        <div className="bg-white/10 p-4 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">{tableName}</h3>
          <div className="text-purple-300 text-sm mt-1">
            {rows.length} row{rows.length !== 1 ? "s" : ""} (limit: {rowLimit})
          </div>
        </div>
        {rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/10 sticky top-0">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.name}
                      className="px-4 py-3 text-left text-purple-300 font-semibold"
                    >
                      <div>{col.name}</div>
                      <div className="text-xs text-gray-400 font-normal">
                        {col.type}
                        {col.primaryKey && " • PK"}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-white/5 hover:bg-white/5 transition-colors"
                  >
                    {columns.map((col) => (
                      <td key={col.name} className="px-4 py-3 text-white">
                        {renderValue(row[col.name], col.name)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">No data in this table</div>
        )}
      </div>
      {renderValueDialog()}
    </>
  );
}
