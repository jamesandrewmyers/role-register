"use client";

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

interface DataReceivedListProps {
  items: DataReceived[];
  onSelectItem: (item: DataReceived) => void;
}

export default function DataReceivedList({ items, onSelectItem }: DataReceivedListProps) {
  return (
    <>
      <h2 className="text-2xl font-bold text-white mb-4">Data Received</h2>
      {items && items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-semibold flex-1">{item.title} - {item.id}</h3>
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
}
