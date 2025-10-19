"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import RoleListingsList from "./RoleListingsList";
import type { EnrichedRoleListingDTO } from "@/dto/enrichedRoleListing.dto";

interface RoleListingSearchProps {
  listings: EnrichedRoleListingDTO[];
  onSelectListing: (listing: EnrichedRoleListingDTO) => void;
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
  
  const [filteredListings, setFilteredListings] = useState<EnrichedRoleListingDTO[]>(listings);
  const [companies, setCompanies] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [companyCounts, setCompanyCounts] = useState<Record<string, number>>({});
  const [locationCounts, setLocationCounts] = useState<Record<string, number>>({});
  const [workArrangementCounts, setWorkArrangementCounts] = useState<Record<string, number>>({});
  const [filteredCompanyCounts, setFilteredCompanyCounts] = useState<Record<string, number>>({});
  const [filteredLocationCounts, setFilteredLocationCounts] = useState<Record<string, number>>({});
  const [filteredWorkArrangementCounts, setFilteredWorkArrangementCounts] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<string>("capturedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  useEffect(() => {
    const uniqueCompanies = Array.from(new Set(
      listings
        .map(l => l.company?.name)
        .filter(Boolean)
    )) as string[];
    setCompanies(uniqueCompanies.sort());
    
    const uniqueLocations = Array.from(new Set(
      listings
        .map(l => l.location ? `${l.location.city}, ${l.location.state.abbreviation}` : null)
        .filter(Boolean)
    )) as string[];
    setLocations(uniqueLocations.sort());
    
    const totalCompanyCounts: Record<string, number> = {};
    const totalLocationCounts: Record<string, number> = {};
    const totalWorkArrangementCounts: Record<string, number> = {};
    
    listings.forEach(l => {
      if (l.company?.name) {
        totalCompanyCounts[l.company.name] = (totalCompanyCounts[l.company.name] || 0) + 1;
      }
      if (l.location) {
        const locationStr = `${l.location.city}, ${l.location.state.abbreviation}`;
        totalLocationCounts[locationStr] = (totalLocationCounts[locationStr] || 0) + 1;
      }
      if (l.workArrangement) {
        totalWorkArrangementCounts[l.workArrangement] = (totalWorkArrangementCounts[l.workArrangement] || 0) + 1;
      }
    });
    
    setCompanyCounts(totalCompanyCounts);
    setLocationCounts(totalLocationCounts);
    setWorkArrangementCounts(totalWorkArrangementCounts);
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
        const locationStr = `${l.location.city}, ${l.location.state.abbreviation}`;
        return locationFilter.includes(locationStr);
      });
    }
    
    if (workArrangementFilter.length > 0) {
      filtered = filtered.filter(l => 
        l.workArrangement && workArrangementFilter.includes(l.workArrangement)
      );
    }
    
    setFilteredListings(filtered);
    
    const newFilteredCompanyCounts: Record<string, number> = {};
    const newFilteredLocationCounts: Record<string, number> = {};
    const newFilteredWorkArrangementCounts: Record<string, number> = {};
    
    filtered.forEach(l => {
      if (l.company?.name) {
        newFilteredCompanyCounts[l.company.name] = (newFilteredCompanyCounts[l.company.name] || 0) + 1;
      }
      if (l.location) {
        const locationStr = `${l.location.city}, ${l.location.state.abbreviation}`;
        newFilteredLocationCounts[locationStr] = (newFilteredLocationCounts[locationStr] || 0) + 1;
      }
      if (l.workArrangement) {
        newFilteredWorkArrangementCounts[l.workArrangement] = (newFilteredWorkArrangementCounts[l.workArrangement] || 0) + 1;
      }
    });
    
    setFilteredCompanyCounts(newFilteredCompanyCounts);
    setFilteredLocationCounts(newFilteredLocationCounts);
    setFilteredWorkArrangementCounts(newFilteredWorkArrangementCounts);
  }, [listings, titleFilter, descriptionFilter, capturedAtFilter, companyFilter, locationFilter, workArrangementFilter]);

  const sortedListings = [...filteredListings].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    switch (sortBy) {
      case "title":
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
        break;
      case "company":
        aVal = a.company?.name?.toLowerCase() || "";
        bVal = b.company?.name?.toLowerCase() || "";
        break;
      case "location":
        aVal = a.location ? `${a.location.city}, ${a.location.state.abbreviation}` : "";
        bVal = b.location ? `${b.location.city}, ${b.location.state.abbreviation}` : "";
        break;
      case "capturedAt":
        aVal = Number(a.capturedAt);
        bVal = Number(b.capturedAt);
        break;
      case "workArrangement":
        aVal = a.workArrangement || "";
        bVal = b.workArrangement || "";
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

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
      className="flex h-full w-full"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        className="h-full overflow-auto p-2"
        style={{ width: `${leftWidth}%` }}
      >
        <div className="space-y-2">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <input
              type="text"
              value={titleFilter}
              onChange={(e) => setTitleFilter(e.target.value)}
              placeholder="Search by title..."
              className="w-full bg-black/20 border border-purple-400/30 rounded-lg px-4 py-2 text-white placeholder-gray-500"
            />
          </div>
          
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <input
              type="text"
              value={descriptionFilter}
              onChange={(e) => setDescriptionFilter(e.target.value)}
              placeholder="Search by description..."
              className="w-full bg-black/20 border border-purple-400/30 rounded-lg px-4 py-2 text-white placeholder-gray-500"
            />
          </div>
          
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <DatePicker
              selected={capturedAtFilter}
              onChange={(date) => setCapturedAtFilter(date)}
              placeholderText="Select import date..."
              className="w-full bg-black/20 border border-purple-400/30 rounded-lg px-4 py-2 text-white placeholder-gray-500"
              dateFormat="MM/dd/yyyy"
              isClearable
              onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
                // Progressive MM/DD/YYYY validator (partial-friendly)
                const partialDate = /^(?:$|(?:0|[1-9]|0[1-9]|1[0-2])|(?:0?[1-9]|1[0-2])\/|(?:0?[1-9]|1[0-2])\/(?:0|[12]|3|0[1-9]|[12][0-9]|3[01])|(?:0?[1-9]|1[0-2])\/(?:0?[1-9]|[12][0-9]|3[01])\/|(?:0?[1-9]|1[0-2])\/(?:0?[1-9]|[12][0-9]|3[01])\/\d{0,4})$/;

                const el = e.currentTarget as HTMLInputElement;
                const k = e.key;

                if (k.length === 1 && !/[0-9/]/.test(k)) { e.preventDefault(); return; }

                if (k.length === 1) {
                  const s = el.selectionStart ?? el.value.length;
                  const t = el.selectionEnd ?? el.value.length;
                  const next = el.value.slice(0, s) + k + el.value.slice(t);

                  if (next.length > 10 || !partialDate.test(next)) e.preventDefault();
                }
              }}

            />
          </div>
          
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
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
          
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
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
          
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
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
        className="h-full overflow-auto p-2 pb-8"
        style={{ width: `${100 - leftWidth}%` }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="text-white font-semibold">
            {filteredListings.length} {filteredListings.length === 1 ? 'result' : 'results'}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-semibold">Sort by |</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-black/20 border border-purple-400/30 rounded-lg px-3 py-1 text-white text-sm"
            >
              <option value="capturedAt">Import Date</option>
              <option value="title">Title</option>
              <option value="company">Company</option>
              <option value="location">Location</option>
              <option value="workArrangement">Work Arrangement</option>
            </select>
            <button
              onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
              className="p-2 bg-black/20 border border-purple-400/30 rounded-lg hover:bg-purple-500/30 transition-colors"
              title={sortDirection === "asc" ? "Ascending" : "Descending"}
            >
              <svg
                className={`w-4 h-4 text-white transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          </div>
        </div>
        <RoleListingsList listings={sortedListings} onSelectListing={onSelectListing} />
      </div>
    </div>
  );
}
