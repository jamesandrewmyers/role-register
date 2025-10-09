"use client";

import { useState, useEffect } from "react";
import RoleEventDetails from "./RoleEventDetails";
import type { RoleEventDTO } from "@/dto/roleEvent.dto";

interface RoleListing {
  id: string;
}

type RoleEvent = RoleEventDTO;

interface RoleListingEventListProps {
  listing: RoleListing;
  onAddEvent?: () => void;
  triggerAdd?: boolean;
}

const EVENT_TYPE_ORDER = ["Not Applying", "Decline", "Rejection", "Offer", "Interview", "Application", "Email", "Phone Call", "Phone Text", "Instant Message"];

function sortEvents(events: RoleEvent[]): RoleEvent[] {
  return [...events].sort((a, b) => {
    if (a.eventDate !== b.eventDate) {
      if (a.eventDate === null) return 1;
      if (b.eventDate === null) return -1;
      return b.eventDate - a.eventDate;
    }
    
    const aIndex = EVENT_TYPE_ORDER.indexOf(a.eventType);
    const bIndex = EVENT_TYPE_ORDER.indexOf(b.eventType);
    return aIndex - bIndex;
  });
}

export default function RoleListingEventList({ listing, onAddEvent, triggerAdd }: RoleListingEventListProps) {
  const [events, setEvents] = useState<RoleEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<RoleEvent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = async () => {
    const response = await fetch(`/api/role-listing/${listing.id}/events`);
    if (response.ok) {
      const fetchedEvents = await response.json();
      setEvents(sortEvents(fetchedEvents));
      setIsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedEvent(null);
    setIsCreating(false);
    fetchEvents();
  };

  const handleAddEvent = () => {
    setIsCreating(true);
    if (onAddEvent) onAddEvent();
  };

  useEffect(() => {
    fetchEvents();
  }, [listing.id]);

  useEffect(() => {
    if (triggerAdd) {
      handleAddEvent();
    }
  }, [triggerAdd]);

  return (
    <>
      {(selectedEvent || isCreating) && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
          <div className="bg-gradient-to-br from-slate-800 to-purple-900 border border-purple-400/30 rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <RoleEventDetails 
              event={selectedEvent || undefined} 
              listingId={isCreating ? listing.id : undefined}
              onClose={handleCloseDetails} 
            />
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : events.length === 0 ? (
        <div className="text-gray-400 text-sm">No events</div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left text-purple-300 text-xs font-semibold uppercase tracking-wide pb-2">Date</th>
                <th className="text-left text-purple-300 text-xs font-semibold uppercase tracking-wide pb-2">Type</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr 
                  key={event.id} 
                  className="border-t border-white/10 cursor-pointer hover:bg-white/5"
                  onClick={() => setSelectedEvent(event)}
                >
                  <td className="text-white py-2">
                    {event.eventDate ? new Date(event.eventDate * 1000).toLocaleDateString() : '-'}
                  </td>
                  <td className="text-white py-2">{event.eventType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
