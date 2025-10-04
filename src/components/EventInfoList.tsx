"use client";

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

interface EventInfoListProps {
  events: EventInfo[];
  onSelectEvent: (event: EventInfo) => void;
}

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  processing: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  done: "bg-green-500/20 text-green-300 border-green-500/30",
  error: "bg-red-500/20 text-red-300 border-red-500/30",
};

export default function EventInfoList({ events, onSelectEvent }: EventInfoListProps) {
  return (
    <>
      <h2 className="text-2xl font-bold text-white mb-4">Event Queue</h2>
      {events && events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => onSelectEvent(event)}
              className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{event.type} - {event.id}</h3>
                  <div className="text-gray-400 text-xs mt-1">
                    {new Date(Number(event.createdAt) * 1000).toLocaleString()}
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
