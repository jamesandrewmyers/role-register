"use client";

import { useEffect, useState } from "react";
import AdminDialog from "@/components/AdminDialog";
import RoleListingDetails from "@/components/RoleListingDetails";
import DataReceivedDetails from "@/components/DataReceivedDetails";
import EventInfoDetails from "@/components/EventInfoDetails";
import RoleListingsList from "@/components/RoleListingsList";
import DataReceivedList from "@/components/DataReceivedList";
import EventInfoList from "@/components/EventInfoList";

interface DataReceived {
  id: string;
  url: string;
  title: string;
  receivedAt: string;
  processed: string;
  processingNotes?: string;
  html?: string;
  text?: string;
}

interface EventInfo {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  error?: string;
  retries: number;
  payload?: string;
}

interface RoleListing {
  id: string;
  title: string;
  description: string;
  capturedAt: string;
  companyId?: string;
}

interface DashboardData {
  dataReceived: DataReceived[];
  eventInfo: EventInfo[];
  roleListings: RoleListing[];
}

type ViewType = "roleListings" | "dataReceived" | "eventInfo";

export default function Page() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<ViewType>("roleListings");
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedListing, setSelectedListing] = useState<RoleListing | null>(null);
  const [selectedDataReceived, setSelectedDataReceived] = useState<DataReceived | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventInfo | null>(null);

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

  const renderContent = () => {
    switch (selectedView) {
      case "roleListings":
        return (
          <RoleListingsList 
            listings={data?.roleListings || []} 
            onSelectListing={setSelectedListing}
          />
        );

      case "dataReceived":
        return (
          <DataReceivedList 
            items={data?.dataReceived || []} 
            onSelectItem={setSelectedDataReceived}
          />
        );

      case "eventInfo":
        return (
          <EventInfoList 
            events={data?.eventInfo || []} 
            onSelectEvent={setSelectedEvent}
          />
        );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center mb-12 relative">
          <h1 className="text-5xl font-bold text-white mb-2">Role Register</h1>
          <p className="text-purple-300 text-lg">Job Application Tracking Dashboard</p>
          <button
            onClick={() => setShowAdmin(true)}
            className="absolute top-0 right-0 p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-all group"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setSelectedView("roleListings")}
            className={`rounded-2xl p-6 border transition-all ${
              selectedView === "roleListings"
                ? "bg-purple-500/30 border-purple-400/50 backdrop-blur-lg shadow-lg shadow-purple-500/20"
                : "bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/15"
            }`}
          >
            <div className="text-purple-300 text-sm font-semibold mb-2">Role Listings</div>
            <div className="text-4xl font-bold text-white">{data?.roleListings.length || 0}</div>
          </button>
          <button
            onClick={() => setSelectedView("dataReceived")}
            className={`rounded-2xl p-6 border transition-all ${
              selectedView === "dataReceived"
                ? "bg-purple-500/30 border-purple-400/50 backdrop-blur-lg shadow-lg shadow-purple-500/20"
                : "bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/15"
            }`}
          >
            <div className="text-purple-300 text-sm font-semibold mb-2">Data Received</div>
            <div className="text-4xl font-bold text-white">{data?.dataReceived.length || 0}</div>
          </button>
          <button
            onClick={() => setSelectedView("eventInfo")}
            className={`rounded-2xl p-6 border transition-all ${
              selectedView === "eventInfo"
                ? "bg-purple-500/30 border-purple-400/50 backdrop-blur-lg shadow-lg shadow-purple-500/20"
                : "bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/15"
            }`}
          >
            <div className="text-purple-300 text-sm font-semibold mb-2">Events</div>
            <div className="text-4xl font-bold text-white">{data?.eventInfo.length || 0}</div>
          </button>
        </div>

        <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          {renderContent()}
        </section>
      </div>

      <RoleListingDetails listing={selectedListing} onClose={() => setSelectedListing(null)} />
      <DataReceivedDetails item={selectedDataReceived} onClose={() => setSelectedDataReceived(null)} />
      <EventInfoDetails event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      <AdminDialog isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
    </main>
  );
}
