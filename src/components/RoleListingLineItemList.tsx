"use client";

import { useState, useEffect } from "react";
import type { EnrichedRoleListingDTO } from "@/dto/enrichedRoleListing.dto";
import type { RoleLineItemsDTO } from "@/dto/roleLineItems.dto";
import type { LineItemType } from "@/domain/entities/roleLineItems";

interface RoleListingLineItemListProps {
  listing: EnrichedRoleListingDTO;
  type: LineItemType;
}

export default function RoleListingLineItemList({ listing, type }: RoleListingLineItemListProps) {
  const [lineItems, setLineItems] = useState<RoleLineItemsDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLineItems() {
      try {
        const response = await fetch(`/api/role-listing/${listing.id}/line-items?type=${type}`);
        if (response.ok) {
          const data = await response.json();
          setLineItems(data);
        }
      } catch (error) {
        console.error("Failed to fetch line items:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLineItems();
  }, [listing.id, type]);

  if (loading) {
    return (
      <div className="text-purple-300 text-xs py-2">Loading...</div>
    );
  }

  if (lineItems.length === 0) {
    return null;
  }

  const typeLabels: Record<LineItemType, string> = {
    requirement: "Requirements",
    "nice to have": "Nice to Have",
    benefit: "Benefits",
    responsibility: "Responsibilities"
  };

  return (
    <div className="bg-white/5 rounded-lg border border-white/10">
      <div className="p-2">
        <h3 className="text-purple-300 text-xs font-semibold uppercase tracking-wide mb-2">
          {typeLabels[type]}
        </h3>
        <ul className="space-y-1">
          {lineItems.map((item) => (
            <li key={item.id} className="text-white text-xs flex gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>{item.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
