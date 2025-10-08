"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import RoleListingsList from "./RoleListingsList";

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
  workArrangement?: string;
}

interface RoleListingSearchProps {
  listings: RoleListing[];
  onSelectListing: (listing: RoleListing) => void;
}

export default function RoleListingSearch({ listings, onSelectListing }: RoleListingSearchProps) {
  const [leftWidth, setLeftWidth] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  
  const [titleFilter, setTitleFilter] = useState("");
  const [descriptionFilter, setDescriptionFilter] = useState("");
  const [capturedAtFilter, setCapturedAtFilter] = useState<Date | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [workArrangementFilter, setWorkArrangementFilter] = useState<string[]>([]);
  
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);
  
  const [filteredListings, setFilteredListings] = useState<RoleListing[]>(listings);
  const [companies, setCompanies] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [companyCounts, setCompanyCounts] = useState<Record<string, number>>({});
  const [locationCounts, setLocationCounts] = useState<Record<string, number>>({});
  const [workArrangementCounts, setWorkArrangementCounts] = useState<Record<string, number>>({});
  
  useEffect(() => {
    const uniqueCompanies = Array.from(new Set(
      listings
        .map(l => l.company?.name)
        .filter(Boolean)
    )) as string[];
    setCompanies(uniqueCompanies.sort());
    
    const uniqueLocations = Array.from(new Set(
      listings
        .map(l => l.location ? `${l.location.city}, ${l.location.stateAbbreviation}` : null)
        .filter(Boolean)
    )) as string[];
    setLocations(uniqueLocations.sort());
  }, [listings]);
  
  useEffect(() => {
    let filtered = listings;
    
    if (titleFilter) {
      filtered = filtered.filter(l => 
        l.title.toLowerCase().includes(titleFilter.toLowerCase())
      );
    }
    
    if (descriptionFilter) {
      filtered = filtered.filter(l => 
        l.description.toLowerCase().includes(descriptionFilter.toLowerCase())
      );
    }
    
    if (capturedAtFilter) {
      const filterDate = new Date(capturedAtFilter);
      filterDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(l => {
        const listingDate = new Date(Number(l.capturedAt) * 1000);
        listingDate.setHours(0, 0, 0, 0);
        return listingDate.getTime() === filterDate.getTime();
      });
    }
    
    if (companyFilter.length > 0) {
      filtered = filtered.filter(l => 
        l.company?.name && companyFilter.includes(l.company.name)
      );
    }
    
    if (locationFilter.length > 0) {
      filtered = filtered.filter(l => {
        if (!l.location) return false;
        const locationStr = `${l.location.city}, ${l.location.stateAbbreviation}`;
        return locationFilter.includes(locationStr);
      });
    }
    
    if (workArrangementFilter.length > 0) {
      filtered = filtered.filter(l => 
        l.workArrangement && workArrangementFilter.includes(l.workArrangement)
      );
    }
    
    setFilteredListings(filtered);
    
    const newCompanyCounts: Record<string, number> = {};
    const newLocationCounts: Record<string, number> = {};
    const newWorkArrangementCounts: Record<string, number> = {};
    
    filtered.forEach(l => {
      if (l.company?.name) {
        newCompanyCounts[l.company.name] = (newCompanyCounts[l.company.name] || 0) + 1;
      }
      if (l.location) {
        const locationStr = `${l.location.city}, ${l.location.stateAbbreviation}`;
        newLocationCounts[locationStr] = (newLocationCounts[locationStr] || 0) + 1;
      }
      if (l.workArrangement) {
        newWorkArrangementCounts[l.workArrangement] = (newWorkArrangementCounts[l.workArrangement] || 0) + 1;
      }
    });
    
    setCompanyCounts(newCompanyCounts);
    setLocationCounts(newLocationCounts);
    setWorkArrangementCounts(newWorkArrangementCounts);
  }, [listings, titleFilter, descriptionFilter, capturedAtFilter, companyFilter, locationFilter, workArrangementFilter]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const containerWidth = window.innerWidth;
    const newLeftWidth = (e.clientX / containerWidth) * 100;
    if (newLeftWidth >= 10 && newLeftWidth <= 50) {
      setLeftWidth(newLeftWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    setLeftWidth(30);
  };

  return (
    <div 
      className="flex h-screen w-full"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        className="h-full overflow-auto p-2"
        style={{ width: `${leftWidth}%` }}
      >
        <h2 className="text-2xl font-bold text-white mb-4">Search Filters</h2>
        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <label className="block text-purple-300 text-sm font-semibold mb-2">
              Title
            </label>
            <input
              type="text"
              value={titleFilter}
              onChange={(e) => setTitleFilter(e.target.value)}
              placeholder="Search by title..."
              className="w-full bg-black/20 border border-purple-400/30 rounded-lg px-4 py-2 text-white placeholder-gray-500"
            />
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <label className="block text-purple-300 text-sm font-semibold mb-2">
              Description
            </label>
            <input
              type="text"
              value={descriptionFilter}
              onChange={(e) => setDescriptionFilter(e.target.value)}
              placeholder="Search by description..."
              className="w-full bg-black/20 border border-purple-400/30 rounded-lg px-4 py-2 text-white placeholder-gray-500"
            />
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <label className="block text-purple-300 text-sm font-semibold mb-2">
              Captured Date
            </label>
            <DatePicker
              selected={capturedAtFilter}
              onChange={(date) => setCapturedAtFilter(date)}
              placeholderText="Select date..."
              className="w-full bg-black/20 border border-purple-400/30 rounded-lg px-4 py-2 text-white placeholder-gray-500"
              dateFormat="MM/dd/yyyy"
              isClearable
            />
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <label className="block text-purple-300 text-sm font-semibold mb-2">
              Company
            </label>
            <div className="space-y-2">
              {(showAllCompanies ? companies : companies.slice(0, 5)).map(company => (
                <label key={company} className="flex items-center text-white text-sm cursor-pointer hover:text-purple-300">
                  <input
                    type="checkbox"
                    checked={companyFilter.includes(company)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCompanyFilter([...companyFilter, company]);
                      } else {
                        setCompanyFilter(companyFilter.filter(c => c !== company));
                      }
                    }}
                    className="mr-2"
                  />
                  {company} ({companyCounts[company] || 0})
                </label>
              ))}
              {companies.length > 5 && !showAllCompanies && (
                <button
                  onClick={() => setShowAllCompanies(true)}
                  className="text-purple-400 text-sm hover:text-purple-300 underline"
                >
                  View all ({companies.length})
                </button>
              )}
              {showAllCompanies && (
                <button
                  onClick={() => setShowAllCompanies(false)}
                  className="text-purple-400 text-sm hover:text-purple-300 underline"
                >
                  Show less
                </button>
              )}
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <label className="block text-purple-300 text-sm font-semibold mb-2">
              Location
            </label>
            <div className="space-y-2">
              {(showAllLocations ? locations : locations.slice(0, 5)).map(location => (
                <label key={location} className="flex items-center text-white text-sm cursor-pointer hover:text-purple-300">
                  <input
                    type="checkbox"
                    checked={locationFilter.includes(location)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setLocationFilter([...locationFilter, location]);
                      } else {
                        setLocationFilter(locationFilter.filter(l => l !== location));
                      }
                    }}
                    className="mr-2"
                  />
                  {location} ({locationCounts[location] || 0})
                </label>
              ))}
              {locations.length > 5 && !showAllLocations && (
                <button
                  onClick={() => setShowAllLocations(true)}
                  className="text-purple-400 text-sm hover:text-purple-300 underline"
                >
                  View all ({locations.length})
                </button>
              )}
              {showAllLocations && (
                <button
                  onClick={() => setShowAllLocations(false)}
                  className="text-purple-400 text-sm hover:text-purple-300 underline"
                >
                  Show less
                </button>
              )}
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <label className="block text-purple-300 text-sm font-semibold mb-2">
              Work Arrangement
            </label>
            <div className="space-y-2">
              {['hybrid', 'on-site', 'remote'].map(arrangement => (
                <label key={arrangement} className="flex items-center text-white text-sm cursor-pointer hover:text-purple-300">
                  <input
                    type="checkbox"
                    checked={workArrangementFilter.includes(arrangement)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setWorkArrangementFilter([...workArrangementFilter, arrangement]);
                      } else {
                        setWorkArrangementFilter(workArrangementFilter.filter(w => w !== arrangement));
                      }
                    }}
                    className="mr-2"
                  />
                  {arrangement.charAt(0).toUpperCase() + arrangement.slice(1)} ({workArrangementCounts[arrangement] || 0})
                </label>
              ))}
            </div>
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
        className="h-full overflow-auto p-2"
        style={{ width: `${100 - leftWidth}%` }}
      >
        <RoleListingsList listings={filteredListings} onSelectListing={onSelectListing} />
      </div>
    </div>
  );
}
