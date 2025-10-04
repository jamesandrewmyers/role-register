"use client";

interface RoleListing {
  id: string;
  title: string;
  description: string;
  capturedAt: string;
  companyId?: string;
}

interface RoleListingsListProps {
  listings: RoleListing[];
  onSelectListing: (listing: RoleListing) => void;
}

export default function RoleListingsList({ listings, onSelectListing }: RoleListingsListProps) {
  return (
    <>
      <h2 className="text-2xl font-bold text-white mb-4">Role Listings</h2>
      {listings && listings.length > 0 ? (
        <div className="space-y-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              onClick={() => onSelectListing(listing)}
              className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <h3 className="text-white font-semibold mb-2">{listing.title}</h3>
              <p className="text-gray-300 text-sm mb-2 line-clamp-2">{listing.description}</p>
              <div className="text-gray-400 text-xs">
                Captured: {new Date(listing.capturedAt * 1000).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 text-center py-8">No role listings captured yet</div>
      )}
    </>
  );
}
