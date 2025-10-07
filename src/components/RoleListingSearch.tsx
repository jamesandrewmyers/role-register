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
  const [leftWidth, setLeftWidth] = useState(20);
  const [isDragging, setIsDragging] = useState(false);
  
  const [titleFilter, setTitleFilter] = useState("");
  const [descriptionFilter, setDescriptionFilter] = useState("");
  const [capturedAtFilter, setCapturedAtFilter] = useState<Date | null>(null);
  const [companyFilter, setCompanyFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [workArrangementFilter, setWorkArrangementFilter] = useState("");
  
  const [filteredListings, setFilteredListings] = useState<RoleListing[]>(listings);
  const [companies, setCompanies] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  
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
    
    if (companyFilter) {
      filtered = filtered.filter(l => l.company?.name === companyFilter);
    }
    
    if (locationFilter) {
      filtered = filtered.filter(l => {
        if (!l.location) return false;
        return `${l.location.city}, ${l.location.stateAbbreviation}` === locationFilter;
      });
    }
    
    if (workArrangementFilter) {
      filtered = filtered.filter(l => l.workArrangement === workArrangementFilter);
    }
    
    setFilteredListings(filtered);
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
    setLeftWidth(20);
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
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full bg-black/20 border border-purple-400/30 rounded-lg px-4 py-2 text-white"
            >
              <option value="">All Companies</option>
              {companies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <label className="block text-purple-300 text-sm font-semibold mb-2">
              Location
            </label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full bg-black/20 border border-purple-400/30 rounded-lg px-4 py-2 text-white"
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <label className="block text-purple-300 text-sm font-semibold mb-2">
              Work Arrangement
            </label>
            <select
              value={workArrangementFilter}
              onChange={(e) => setWorkArrangementFilter(e.target.value)}
              className="w-full bg-black/20 border border-purple-400/30 rounded-lg px-4 py-2 text-white"
            >
              <option value="">All Arrangements</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="on-site">On-site</option>
            </select>
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
        className="h-full overflow-auto p-6"
        style={{ width: `${100 - leftWidth}%` }}
      >
        <RoleListingsList listings={filteredListings} onSelectListing={onSelectListing} />
      </div>
    </div>
  );
}
