"use client";

import { useState } from "react";
import RoleListingEventList from "./RoleListingEventList";
import RoleListingDetails from "./RoleListingDetails";
import type { EnrichedRoleListingDTO } from "@/dto/enrichedRoleListing.dto";

interface RoleListingMainViewProps {
  listing: EnrichedRoleListingDTO;
  sidebarChildren?: React.ReactNode;
}

export default function RoleListingMainView({ listing, sidebarChildren }: RoleListingMainViewProps) {
  const [leftWidth, setLeftWidth] = useState(73);
  const [isDragging, setIsDragging] = useState(false);
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);
  const [isEventsCollapsed, setIsEventsCollapsed] = useState(false);
  const [triggerAddEvent, setTriggerAddEvent] = useState(false);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const containerWidth = window.innerWidth;
    const newLeftWidth = (e.clientX / containerWidth) * 100;
    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftWidth(newLeftWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    setLeftWidth(73);
  };

  return (
    <div 
      className="flex h-screen w-full"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        className="h-full overflow-auto p-6"
        style={{ width: `${leftWidth}%` }}
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{listing.title}</h1>
            {listing.company && (
              <p className="text-xl text-purple-300">{listing.company.name}</p>
            )}
            {listing.location && (
              <p className="text-sm text-gray-400">
                {listing.location.city}, {listing.location.locationState}
              </p>
            )}
          </div>

          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-purple-300 mb-4">Description</h2>
            <div 
              className="text-white"
              dangerouslySetInnerHTML={{ __html: listing.description }}
            />
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-sm text-gray-400">
              Captured: {new Date(listing.capturedAt * 1000).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div 
        className="w-1 bg-gray-600 hover:bg-purple-500 cursor-col-resize relative"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        {isDragging && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-900 border border-purple-400 rounded px-3 py-2 text-white text-sm font-semibold whitespace-nowrap shadow-lg z-50">
            {Math.round(leftWidth)}% / {Math.round(100 - leftWidth)}%
          </div>
        )}
      </div>

      <div 
        className="h-full flex flex-col"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {sidebarChildren}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          <div className="bg-white/5 rounded-lg border border-white/10">
            <div 
              className="flex items-center justify-between p-2 cursor-pointer"
              onClick={() => setIsDetailsCollapsed(!isDetailsCollapsed)}
            >
              <h3 className="text-purple-300 text-xs font-semibold uppercase tracking-wide">Details</h3>
              <span className="text-purple-300 text-xs">{isDetailsCollapsed ? '▼' : '▲'}</span>
            </div>
            {!isDetailsCollapsed && (
              <div className="px-2 pb-2">
                <RoleListingDetails 
                  listing={listing}
                  onClose={() => {}}
                  fieldConfig={{
                    id: true,
                    capturedAt: true,
                    compact: true
                  }}
                  inline={true}
                />
              </div>
            )}
          </div>
          
          <div className="bg-white/5 rounded-lg border border-white/10">
            <div 
              className="flex items-center justify-between p-2 cursor-pointer"
              onClick={() => setIsEventsCollapsed(!isEventsCollapsed)}
            >
              <h3 className="text-purple-300 text-xs font-semibold uppercase tracking-wide">Listing Events</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEventsCollapsed(false);
                    setTriggerAddEvent(true);
                  }}
                  className="text-purple-300 hover:text-white text-lg"
                  title="Add Event"
                >
                  +
                </button>
                <span className="text-purple-300 text-xs">
                  {isEventsCollapsed ? '▼' : '▲'}
                </span>
              </div>
            </div>
            <div className={isEventsCollapsed ? "hidden" : "px-2 pb-2"}>
              <RoleListingEventList 
                listing={listing}
                onAddEvent={() => setTriggerAddEvent(false)}
                triggerAdd={triggerAddEvent}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
