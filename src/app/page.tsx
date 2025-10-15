"use client";

import { useEffect, useState } from "react";
import AdminDialog from "@/components/AdminDialog";
import RoleListingMainView from "@/components/RoleListingMainView";
import RoleListingSearch from "@/components/RoleListingSearch";
import type { EnrichedRoleListingDTO } from "@/dto/enrichedRoleListing.dto";

interface DashboardData {
  roleListings: EnrichedRoleListingDTO[];
}

export default function Page() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedListing, setSelectedListing] = useState<EnrichedRoleListingDTO | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-white text-center text-xl">Loading dashboard...</div>
        </div>
      </main>
    );
  }

  if (selectedListing) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <RoleListingMainView 
          listing={selectedListing}
          sidebarChildren={
            <button
              onClick={() => setSelectedListing(null)}
              className="p-4 bg-purple-500/30 hover:bg-purple-500/50 text-white transition-colors"
            >
              ← Back to Listings
            </button>
          }
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="h-screen flex flex-col">
        <header className="p-6 relative">
          <h1 className="text-4xl font-bold text-white text-center">Role Register</h1>
          <button
            onClick={() => setShowAdmin(true)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-all group"
            aria-label="Admin settings"
          >
            <svg
              className="w-6 h-6 text-purple-300 group-hover:text-white transition-colors group-hover:rotate-90 transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-hidden">
          <RoleListingSearch 
            listings={data?.roleListings || []} 
            onSelectListing={setSelectedListing}
          />
        </div>
      </div>

      <AdminDialog isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
    </main>
  );
}
