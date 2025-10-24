"use client";

import { useState, useRef, useEffect } from "react";

export interface DataReceivedWithListing {
  id: string;
  url: string;
  title: string;
  html: string;
  text: string;
  receivedAt: number;
  processed: string;
  processingNotes?: string;
  roleListing?: {
    title: string;
    companyName: string;
  };
}

interface DataReceivedListProps {
  items: DataReceivedWithListing[];
  onSelectItem: (item: DataReceivedWithListing) => void;
}

export default function DataReceivedList({ items, onSelectItem }: DataReceivedListProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleProcessedMouseEnter = (item: DataReceivedWithListing, event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    
    if (!item.roleListing) return;
    
    // Get the parent div (the item container) for positioning
    const parentDiv = event.currentTarget.closest('.bg-white\\/5') as HTMLElement;
    if (parentDiv) {
      const rect = parentDiv.getBoundingClientRect();
      // Position popup's top-right corner at component's top-right corner
      setPopupPosition({ x: rect.right, y: rect.top });
    }
    setHoveredItem(item.id);
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    hoverTimeoutRef.current = setTimeout(() => {
      setShowPopup(true);
    }, 500);
  };

  const handleProcessedMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    if (!showPopup) {
      setHoveredItem(null);
    }
  };

  const handlePopupMouseLeave = () => {
    setShowPopup(false);
    setHoveredItem(null);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const hoveredItemData = items.find(i => i.id === hoveredItem);
  return (
    <>
      <h2 className="text-2xl font-bold text-white mb-4">Data Received</h2>
      {items && items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-semibold flex-1">{item.title} - {item.id}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    item.processed === "true"
                      ? "bg-green-500/20 text-green-300 border-green-500/30"
                      : item.processed === "failed"
                      ? "bg-red-500/20 text-red-300 border-red-500/30"
                      : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                  }`}
                  onMouseEnter={item.processed === "true" && item.roleListing ? (e) => handleProcessedMouseEnter(item, e) : undefined}
                  onMouseLeave={item.processed === "true" && item.roleListing ? handleProcessedMouseLeave : undefined}
                >
                  {item.processed === "true" ? "Processed" : item.processed === "failed" ? "Failed" : "Pending"}
                </span>
              </div>
              <a 
                href={item.url} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 text-sm hover:underline inline-block truncate mb-1 max-w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {item.url}
              </a>
              <div className="text-gray-400 text-xs">
                {new Date(Number(item.receivedAt) * 1000).toLocaleString()}
              </div>
              {item.processingNotes && (
                <div className="mt-2 text-yellow-300 text-sm break-words">{item.processingNotes}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 text-center py-8">No data received yet</div>
      )}

      {showPopup && hoveredItemData?.roleListing && (
        <div
          className="fixed z-50 bg-gradient-to-br from-slate-800 to-purple-900 border border-purple-400/30 rounded-lg shadow-2xl p-4"
          style={{
            right: `${window.innerWidth - popupPosition.x}px`,
            top: `${popupPosition.y}px`,
          }}
          onMouseLeave={handlePopupMouseLeave}
        >
          <h1 className="text-2xl font-bold text-white mb-1">{hoveredItemData.roleListing.title}</h1>
          <p className="text-lg text-purple-300">{hoveredItemData.roleListing.companyName}</p>
        </div>
      )}
    </>
  );
}
