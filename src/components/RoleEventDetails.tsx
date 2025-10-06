"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface RoleEvent {
  id: string;
  eventListingId: string;
  eventType: string;
  eventTitle: string;
  eventDate: number | null;
  eventNotes: string | null;
}

interface RoleEventDetailsProps {
  event?: RoleEvent;
  listingId?: string;
  onClose: () => void;
}

const EVENT_TYPES = ["Not Applying", "Decline", "Rejection", "Offer", "Interview", "Application", "Email", "Phone Call", "Phone Text", "Instant Message"];

export default function RoleEventDetails({ event, listingId, onClose }: RoleEventDetailsProps) {
  const isCreateMode = !event && !!listingId;
  const [isEditing, setIsEditing] = useState(isCreateMode);
  const [editedEvent, setEditedEvent] = useState(event || {
    id: '',
    eventListingId: listingId || '',
    eventType: EVENT_TYPES[0],
    eventTitle: '',
    eventDate: null,
    eventNotes: null,
  });

  const handleSave = async () => {
    if (isCreateMode) {
      const response = await fetch(`/api/role-listing/${listingId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: editedEvent.eventType,
          eventTitle: editedEvent.eventTitle,
          eventDate: editedEvent.eventDate,
          eventNotes: editedEvent.eventNotes,
        }),
      });
      
      if (response.ok) {
        onClose();
      }
    } else {
      const response = await fetch(`/api/role-listing/${editedEvent.eventListingId}/events/${editedEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: editedEvent.eventType,
          eventTitle: editedEvent.eventTitle,
          eventDate: editedEvent.eventDate,
          eventNotes: editedEvent.eventNotes,
        }),
      });
      
      if (response.ok) {
        setIsEditing(false);
        onClose();
      }
    }
  };

  const handleCancel = () => {
    if (isCreateMode) {
      onClose();
    } else {
      setEditedEvent(event!);
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-purple-300 text-sm font-semibold uppercase tracking-wide">Event Details</h3>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-white text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="text-purple-300 hover:text-white text-sm"
              >
                Save
              </button>
            </>
          ) : !isCreateMode ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-purple-300 hover:text-white text-sm"
            >
              Edit
            </button>
          ) : null}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-purple-300 text-xs font-semibold uppercase tracking-wide mb-1">Type</div>
          {isEditing ? (
            <select
              value={editedEvent.eventType}
              onChange={(e) => setEditedEvent({ ...editedEvent, eventType: e.target.value })}
              className="w-full bg-[#1a0a2e] border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          ) : (
            <div className="text-white text-sm">{editedEvent.eventType}</div>
          )}
        </div>

        <div>
          <div className="text-purple-300 text-xs font-semibold uppercase tracking-wide mb-1">Title</div>
          {isEditing ? (
            <input
              type="text"
              value={editedEvent.eventTitle}
              onChange={(e) => setEditedEvent({ ...editedEvent, eventTitle: e.target.value })}
              className="w-full bg-[#1a0a2e] border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
            />
          ) : (
            <div className="text-white text-sm">{editedEvent.eventTitle}</div>
          )}
        </div>

        <div>
          <div className="text-purple-300 text-xs font-semibold uppercase tracking-wide mb-1">Date</div>
          {isEditing ? (
            <DatePicker
              selected={editedEvent.eventDate ? new Date(editedEvent.eventDate * 1000) : null}
              onChange={(date: Date | null) => {
                if (date) {
                  const today = new Date();
                  today.setHours(23, 59, 59, 999);
                  if (date <= today) {
                    const timestamp = Math.floor(date.setHours(0, 0, 0, 0) / 1000);
                    setEditedEvent({ ...editedEvent, eventDate: timestamp });
                  }
                }
              }}
              maxDate={new Date()}
              dateFormat="yyyy-MM-dd"
              filterDate={(date) => date <= new Date()}
              customInput={
                <input
                  type="text"
                  maxLength={10}
                  className="box-content w-[10ch] bg-[#1a0a2e] border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              }
            />
          ) : (
            <div className="text-white text-sm">
              {editedEvent.eventDate ? new Date(editedEvent.eventDate * 1000).toLocaleDateString() : '-'}
            </div>
          )}
        </div>

        <div>
          <div className="text-purple-300 text-xs font-semibold uppercase tracking-wide mb-1">Notes</div>
          {isEditing ? (
            <textarea
              value={editedEvent.eventNotes || ''}
              onChange={(e) => setEditedEvent({ ...editedEvent, eventNotes: e.target.value })}
              rows={4}
              className="w-full bg-[#1a0a2e] border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
            />
          ) : (
            <div className="text-white text-sm whitespace-pre-wrap">{editedEvent.eventNotes || '-'}</div>
          )}
        </div>

        {!isCreateMode && (
          <div>
            <div className="text-purple-300 text-xs font-semibold uppercase tracking-wide">ID</div>
            <div className="text-white text-sm">{editedEvent.id}</div>
          </div>
        )}
      </div>
    </div>
  );
}
