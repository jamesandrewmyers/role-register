"use client";

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
}

interface RoleListingMainViewProps {
  listing: RoleListing;
  sidebarChildren?: React.ReactNode;
}

export default function RoleListingMainView({ listing, sidebarChildren }: RoleListingMainViewProps) {
  return (
    <div className="flex h-screen w-full">
      <div className="w-3/4 h-full overflow-auto p-6 border-r border-gray-300">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{listing.title}</h1>
            {listing.company && (
              <p className="text-xl text-purple-300">{listing.company.name}</p>
            )}
            {listing.location && (
              <p className="text-sm text-gray-400">
                {listing.location.city}, {listing.location.stateAbbreviation}
              </p>
            )}
          </div>

          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-purple-300 mb-4">Description</h2>
            <div 
              className="text-white"
              dangerouslySetInnerHTML={{ __html: listing.description }}
            />
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-sm text-gray-400">
              Captured: {new Date(listing.capturedAt * 1000).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="w-1/4 h-full flex flex-col">
        {sidebarChildren}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {(() => {
            const displayData: Record<string, any> = {
              id: listing.id,
              title: listing.title,
              description: listing.description,
            };

            if (listing.company) {
              displayData.company = listing.company.name;
            }

            if (listing.location) {
              displayData.location = `${listing.location.city}, ${listing.location.stateAbbreviation}`;
            }

            displayData.capturedAt = new Date(Number(listing.capturedAt) * 1000).toLocaleString();

            const entries = Object.entries(displayData).filter(([key, value]) => value !== undefined && value !== null);

            return entries.map(([key, value]) => (
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
            ));
          })()}
        </div>
      </div>
    </div>
  );
}
