"use client";

import { useState, useRef, useEffect } from "react";
import type { EnrichedRoleListingDTO } from "@/dto/enrichedRoleListing.dto";

interface RoleListingsListProps {
  listings: EnrichedRoleListingDTO[];
  onSelectListing: (listing: EnrichedRoleListingDTO) => void;
}

export default function RoleListingsList({ listings, onSelectListing }: RoleListingsListProps) {
  const [hoveredListing, setHoveredListing] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleItemMouseEnter = (listingId: string, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupPosition({ x: rect.left + rect.width / 2, y: rect.top });
    setHoveredListing(listingId);
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    hoverTimeoutRef.current = setTimeout(() => {
      setShowPopup(true);
    }, 1000);
  };

  const handleItemMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    if (!showPopup) {
      setHoveredListing(null);
    }
  };

  const handlePopupMouseLeave = () => {
    setShowPopup(false);
    setHoveredListing(null);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const getLocationString = (listing: EnrichedRoleListingDTO) => {
    if (!listing.location) return "";
    return `${listing.location.city}, ${listing.location.state.abbreviation}`;
  };

  const getCompanyName = (listing: EnrichedRoleListingDTO) => {
    return listing.company?.name || "";
  };

  const hoveredListingData = listings.find(l => l.id === hoveredListing);

  return (
    <>
      <h2 className="text-2xl font-bold text-white mb-4">Role Listings</h2>
      {listings && listings.length > 0 ? (
        <div className="space-y-3">
          {listings.map((listing) => {
            const company = getCompanyName(listing);
            const location = getLocationString(listing);
            const subtitle = [company, location].filter(Boolean).join(" - ");

            return (
              <div
                key={listing.id}
                onClick={() => onSelectListing(listing)}
                onMouseEnter={(e) => handleItemMouseEnter(listing.id, e)}
                onMouseLeave={handleItemMouseLeave}
                className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <h3 className="text-white font-semibold mb-2">{subtitle || "Unknown"}</h3>
                <p className="text-gray-300 text-sm mb-2">{listing.title}</p>
                <div className="text-gray-400 text-xs">
                  Captured: {new Date(Number(listing.capturedAt) * 1000).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-gray-400 text-center py-8">No role listings captured yet</div>
      )}

      {showPopup && hoveredListingData && (
        <div
          className="fixed z-50 bg-gradient-to-br from-slate-800 to-purple-900 border border-purple-400/30 rounded-lg shadow-2xl p-4 max-w-2xl max-h-96 overflow-y-auto"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y - 10}px`,
            transform: 'translate(-50%, -100%)',
          }}
          onMouseLeave={handlePopupMouseLeave}
        >
          <div 
            className="text-white text-sm"
            dangerouslySetInnerHTML={{ __html: hoveredListingData.description }}
          />
        </div>
      )}
    </>
  );
}
