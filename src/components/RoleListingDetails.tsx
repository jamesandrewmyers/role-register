"use client";

import type { EnrichedRoleListingDTO } from "@/dto/enrichedRoleListing.dto";

interface FieldConfig {
  id?: boolean;
  title?: boolean;
  description?: boolean;
  company?: boolean;
  location?: boolean;
  capturedAt?: boolean;
  compact?: boolean;
}

interface RoleListingDetailsProps {
  listing: EnrichedRoleListingDTO | null;
  onClose: () => void;
  fieldConfig?: FieldConfig;
  inline?: boolean;
}

export default function RoleListingDetails({ listing, onClose, fieldConfig, inline = false }: RoleListingDetailsProps) {
  if (!listing) return null;

  const config = fieldConfig || {
    id: true,
    title: true,
    description: true,
    company: true,
    location: true,
    capturedAt: true,
  };

  // Create a display object with human-readable values
  const displayData: Record<string, string | number> = {};

  if (config.id) {
    displayData.id = listing.id;
  }

  if (config.title) {
    displayData.title = listing.title;
  }

  if (config.description) {
    displayData.description = listing.description;
  }

  if (config.company && listing.company) {
    displayData.company = listing.company.name;
  }

  if (config.location && listing.location) {
    displayData.location = `${listing.location.city}, ${listing.location.locationState}`;
  }

  if (config.capturedAt) {
    displayData.capturedAt = new Date(Number(listing.capturedAt) * 1000).toLocaleString();
  }

  const entries = Object.entries(displayData).filter(([key, value]) => value !== undefined && value !== null);

  const content = inline ? (
    <div className="bg-white/5 rounded-lg border border-white/10 p-2 space-y-1">
      {entries.map(([key, value]) => (
        <div key={key}>
          {config.compact ? (
            <div className="flex items-start gap-2">
              <div className="text-purple-300 text-xs font-semibold uppercase tracking-wide">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </div>
              <div className="text-white break-words text-xs">
                {typeof value === 'string' && value.length > 200 ? (
                  <div className="text-sm font-mono bg-black/20 p-3 rounded overflow-x-auto max-h-40 overflow-y-auto">
                    {value}
                  </div>
                ) : (
                  String(value)
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="text-purple-300 text-xs font-semibold mb-1 uppercase tracking-wide">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className="text-white break-words text-xs">
                {typeof value === 'string' && value.length > 200 ? (
                  <div className="text-sm font-mono bg-black/20 p-3 rounded overflow-x-auto max-h-40 overflow-y-auto">
                    {value}
                  </div>
                ) : (
                  String(value)
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  ) : (
    <div className="space-y-3">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="bg-white/5 rounded-lg border border-white/10 p-4"
        >
          {config.compact ? (
            <div className="flex items-start gap-2">
              <div className="text-purple-300 text-sm font-semibold uppercase tracking-wide">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
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
          ) : (
            <>
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
            </>
          )}
        </div>
      ))}
    </div>
  );

  if (inline) {
    return content;
  }

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
        <div className="p-6">
          {content}
        </div>
      </div>
    </div>
  );
}
