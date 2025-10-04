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
            <div className="text-white whitespace-pre-wrap">{listing.description}</div>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-sm text-gray-400">
              Captured: {new Date(listing.capturedAt * 1000).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="w-1/4 h-full overflow-y-auto flex flex-col">
        {sidebarChildren}
      </div>
    </div>
  );
}
