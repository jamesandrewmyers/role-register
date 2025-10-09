"use client";

import type { EventInfoDTO } from "@/dto/eventInfo.dto";

type EventInfo = EventInfoDTO;

interface EventInfoDetailsProps {
  event: EventInfo | null;
  onClose: () => void;
}

export default function EventInfoDetails({ event, onClose }: EventInfoDetailsProps) {
  if (!event) return null;

  const displayData = {
    ...event,
    createdAt: new Date(event.createdAt * 1000).toLocaleString(),
    updatedAt: event.updatedAt ? new Date(event.updatedAt * 1000).toLocaleString() : undefined,
  };

  const entries = Object.entries(displayData).filter(([key, value]) => value !== undefined && value !== null);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl border border-purple-400/30 shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-br from-slate-800 to-purple-900 border-b border-purple-400/30 p-6 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white">Details</h3>
          <button
            onClick={onClose}
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
}
