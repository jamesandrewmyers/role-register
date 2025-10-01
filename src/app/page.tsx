"use client";

import { useEffect, useState } from "react";

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
type DetailItem = DataReceived | EventInfo | RoleListing | null;

export default function Page() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<ViewType>("roleListings");
  const [detailItem, setDetailItem] = useState<DetailItem>(null);

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

  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    processing: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    done: "bg-green-500/20 text-green-300 border-green-500/30",
    error: "bg-red-500/20 text-red-300 border-red-500/30",
  };

  const renderDetailDialog = () => {
    if (!detailItem) return null;

    const entries = Object.entries(detailItem).filter(([key, value]) => value !== undefined && value !== null);

    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setDetailItem(null)}
      >
        <div
          className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl border border-purple-400/30 shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-gradient-to-br from-slate-800 to-purple-900 border-b border-purple-400/30 p-6 flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">Details</h3>
            <button
              onClick={() => setDetailItem(null)}
              className="text-purple-300 hover:text-white transition-colors text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="p-6 space-y-3">
            {entries.map(([key, value]) => (
              <div
                key={key}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="text-purple-300 text-sm font-semibold mb-1 uppercase tracking-wide">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-white break-words">
                  {typeof value === 'string' && value.length > 200 ? (
                    <div className="text-sm font-mono bg-black/20 p-3 rounded overflow-x-auto max-h-40 overflow-y-auto">
                      {value}
                    </div>
                  ) : (
                    String(value)
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (selectedView) {
      case "roleListings":
        return (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">Role Listings</h2>
            {data?.roleListings && data.roleListings.length > 0 ? (
              <div className="space-y-3">
                {data.roleListings.map((listing) => (
                  <div
                    key={listing.id}
                    onClick={() => setDetailItem(listing)}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <h3 className="text-white font-semibold mb-2">{listing.title}</h3>
                    <p className="text-gray-300 text-sm mb-2 line-clamp-2">{listing.description}</p>
                    <div className="text-gray-400 text-xs">
                      Captured: {new Date(listing.capturedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">No role listings captured yet</div>
            )}
          </>
        );

      case "dataReceived":
        return (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">Data Received</h2>
            {data?.dataReceived && data.dataReceived.length > 0 ? (
              <div className="space-y-3">
                {data.dataReceived.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setDetailItem(item)}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-semibold flex-1">{item.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          item.processed === "true"
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : item.processed === "failed"
                            ? "bg-red-500/20 text-red-300 border-red-500/30"
                            : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                        }`}
                      >
                        {item.processed === "true" ? "Processed" : item.processed === "failed" ? "Failed" : "Pending"}
                      </span>
                    </div>
                    <a 
                      href={item.url} 
                      className="text-purple-300 text-sm hover:underline block truncate mb-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.url}
                    </a>
                    <div className="text-gray-400 text-xs">
                      {new Date(item.receivedAt).toLocaleString()}
                    </div>
                    {item.processingNotes && (
                      <div className="mt-2 text-yellow-300 text-sm">{item.processingNotes}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">No data received yet</div>
            )}
          </>
        );

      case "eventInfo":
        return (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">Event Queue</h2>
            {data?.eventInfo && data.eventInfo.length > 0 ? (
              <div className="space-y-3">
                {data.eventInfo.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setDetailItem(event)}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{event.type}</h3>
                        <div className="text-gray-400 text-xs mt-1">
                          {new Date(event.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          statusColors[event.status as keyof typeof statusColors] || "bg-gray-500/20 text-gray-300 border-gray-500/30"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                    {event.retries > 0 && (
                      <div className="text-yellow-300 text-sm mb-1">Retries: {event.retries}</div>
                    )}
                    {event.error && (
                      <div className="text-red-300 text-sm mt-2 font-mono bg-red-500/10 p-2 rounded">
                        {event.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">No events in queue</div>
            )}
          </>
        );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">Role Register</h1>
          <p className="text-purple-300 text-lg">Job Application Tracking Dashboard</p>
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

      {renderDetailDialog()}
    </main>
  );
}
