"use client";

import { useState } from "react";
import RoleListingEventList from "./RoleListingEventList";

interface RoleListing {
  id: string;
  title: string;
  description: string;
  capturedAt: string;
  companyId?: string;
  company?: {
    id: string;
    name: string;
    website?: string;
  } | null;
  location?: {
    id: string;
    city: string;
    stateName: string;
    stateAbbreviation: string;
  } | null;
  status?: string;
  appliedAt?: number;
}

interface RoleListingMainViewProps {
  listing: RoleListing;
  sidebarChildren?: React.ReactNode;
}

export default function RoleListingMainView({ listing, sidebarChildren }: RoleListingMainViewProps) {
  const [leftWidth, setLeftWidth] = useState(75);
  const [isDragging, setIsDragging] = useState(false);
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);
  const [isEventsCollapsed, setIsEventsCollapsed] = useState(false);

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
    setLeftWidth(75);
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
                {listing.location.city}, {listing.location.stateAbbreviation}
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
        className="w-1 bg-gray-600 hover:bg-purple-500 cursor-col-resize"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      />

      <div 
        className="h-full flex flex-col"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {sidebarChildren}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          <div className="bg-white/5 rounded-lg border border-white/10">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => setIsDetailsCollapsed(!isDetailsCollapsed)}
            >
              <h3 className="text-purple-300 text-sm font-semibold uppercase tracking-wide">Details</h3>
              <span className="text-purple-300">{isDetailsCollapsed ? '▼' : '▲'}</span>
            </div>
            {!isDetailsCollapsed && (
              <div className="px-4 pb-4 space-y-3">
                <div>
                  <div className="text-purple-300 text-xs font-semibold uppercase tracking-wide">ID</div>
                  <div className="text-white text-sm">{listing.id}</div>
                </div>
                <div>
                  <div className="text-purple-300 text-xs font-semibold uppercase tracking-wide">Title</div>
                  <div className="text-white text-sm">{listing.title}</div>
                </div>
                {listing.company && (
                  <div>
                    <div className="text-purple-300 text-xs font-semibold uppercase tracking-wide">Company</div>
                    <div className="text-white text-sm">{listing.company.name}</div>
                  </div>
                )}
                {listing.location && (
                  <div>
                    <div className="text-purple-300 text-xs font-semibold uppercase tracking-wide">Location</div>
                    <div className="text-white text-sm">{listing.location.city}, {listing.location.stateAbbreviation}</div>
                  </div>
                )}
                <div>
                  <div className="text-purple-300 text-xs font-semibold uppercase tracking-wide">Captured At</div>
                  <div className="text-white text-sm">{new Date(Number(listing.capturedAt) * 1000).toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white/5 rounded-lg border border-white/10">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => setIsEventsCollapsed(!isEventsCollapsed)}
            >
              <h3 className="text-purple-300 text-sm font-semibold uppercase tracking-wide">Listing Events</h3>
              <span className="text-purple-300">{isEventsCollapsed ? '▼' : '▲'}</span>
            </div>
            {!isEventsCollapsed && (
              <div className="px-4 pb-4">
                <RoleListingEventList listing={listing} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
