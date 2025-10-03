"use client";

import { useEffect, useState, useCallback, useRef } from "react";

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

export default function TableViewer({ tableName, rowLimit = 5 }: TableViewerProps) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [scrollContainerRef, setScrollContainerRef] = useState<HTMLDivElement | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const loadingRef = useRef(false);

  const fetchTableData = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setOffset(0);
        setRows([]);
        setSelectedIds(new Set());
      }

      const currentOffset = reset ? 0 : offset;
      
      // Fetch current batch
      const res = await fetch(
        `/api/admin/table-data?table=${encodeURIComponent(tableName)}&limit=${rowLimit}&offset=${currentOffset}`
      );
      const data = await res.json();
      
      if (reset) {
        setColumns(data.columns || []);
        setTotalCount(data.totalCount || 0);
      }
      
      const newRows = data.rows || [];
      const currentTotal = reset ? newRows.length : (rows.length + newRows.length);
      setHasMore(currentTotal < (data.totalCount || 0));
      
      if (reset) {
        setRows(newRows);
        setOffset(0);
      } else {
        setRows(prev => [...prev, ...newRows]);
      }
    } catch (error) {
      console.error("Failed to fetch table data:", error);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (loadingRef.current || isFetching || !hasMore) {
      console.log(`[${tableName}] Skipping loadMore - loading: ${loadingRef.current}, isFetching: ${isFetching}, hasMore: ${hasMore}`);
      return;
    }
    
    loadingRef.current = true;
    setIsFetching(true);
    
    try {
      const newOffset = offset + rowLimit;
      
      console.log(`[${tableName}] Loading more - offset: ${newOffset}, limit: ${rowLimit}, current rows: ${rows.length}`);
      
      const res = await fetch(
        `/api/admin/table-data?table=${encodeURIComponent(tableName)}&limit=${rowLimit}&offset=${newOffset}`
      );
      const data = await res.json();
      const newRows = data.rows || [];
      
      console.log(`[${tableName}] Received ${newRows.length} rows, totalCount: ${data.totalCount}`);
      
      if (newRows.length > 0) {
        const newRowsList = [...rows, ...newRows];
        console.log(`[${tableName}] Now have ${newRowsList.length} rows total, hasMore: ${newRowsList.length < (data.totalCount || 0)}`);
        
        setRows(newRowsList);
        setOffset(newOffset);
        setHasMore(newRowsList.length < (data.totalCount || 0));
      } else {
        console.log(`[${tableName}] No more rows, setting hasMore to false`);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more:", error);
    } finally {
      loadingRef.current = false;
      setIsFetching(false);
    }
  }, [isFetching, hasMore, offset, rowLimit, tableName, rows]);

  useEffect(() => {
    fetchTableData(true);
  }, [tableName, rowLimit]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef || isFetching || !hasMore) return;
    
    const scrollPosition = scrollContainerRef.scrollTop + scrollContainerRef.clientHeight;
    const scrollThreshold = scrollContainerRef.scrollHeight - 100;

    if (scrollPosition >= scrollThreshold) {
      loadMore();
    }
  }, [scrollContainerRef, isFetching, hasMore, loadMore]);

  useEffect(() => {
    if (!scrollContainerRef) return;

    scrollContainerRef.addEventListener('scroll', handleScroll);
    return () => scrollContainerRef.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef, handleScroll]);
  
  // Auto-load more rows if container isn't scrollable yet
  useEffect(() => {
    if (!scrollContainerRef || isFetching || !hasMore || loading) return;
    
    if (scrollContainerRef.scrollHeight <= scrollContainerRef.clientHeight) {
      loadMore();
    }
  }, [scrollContainerRef, rows, hasMore, isFetching, loading, loadMore]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(rows.map(row => row.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (!confirm(`Delete ${selectedIds.size} row(s)?`)) return;

    try {
      setDeleting(true);
      const res = await fetch('/api/admin/delete-rows', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableName,
          ids: Array.from(selectedIds),
        }),
      });

      if (res.ok) {
        await fetchTableData(true);
      } else {
        alert('Failed to delete rows');
      }
    } catch (error) {
      console.error('Failed to delete rows:', error);
      alert('Failed to delete rows');
    } finally {
      setDeleting(false);
    }
  };

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
        <div className="bg-white/10 p-4 border-b border-white/10 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white">{tableName}</h3>
            <div className="text-purple-300 text-sm mt-1">
              {rows.length} of {totalCount} row{totalCount !== 1 ? "s" : ""}
              {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
            </div>
          </div>
          {selectedIds.size > 0 && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg border border-red-500/30 transition-colors disabled:opacity-50"
              title="Delete selected rows"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
        {rows.length > 0 ? (
          <div ref={setScrollContainerRef} className="overflow-x-auto max-h-[400px] overflow-y-auto admin-table-scroll">
            <table className="w-full text-sm">
              <thead className="bg-white/10 sticky top-0">
                <tr>
                  <th className="px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={rows.length > 0 && selectedIds.size === rows.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-purple-400/30 bg-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                    />
                  </th>
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
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                        className="w-4 h-4 rounded border-purple-400/30 bg-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                      />
                    </td>
                    {columns.map((col) => (
                      <td key={col.name} className="px-4 py-3 text-white">
                        {renderValue(row[col.name], col.name)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {isFetching && (
              <div className="text-center py-4 text-purple-300">Loading more...</div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">No data in this table</div>
        )}
      </div>
      {renderValueDialog()}
    </>
  );
}
