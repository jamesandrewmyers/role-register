'use client';

import { useState } from 'react';
import type { ValueMapping } from '@/domain/entities/valueMapping';

interface ValueMappingHierarchyViewProps {
  mappings: ValueMapping[];
  onEdit: (mapping: ValueMapping) => void;
  onDelete: (mappingId: string) => void;
  onReorder: (mappings: ValueMapping[]) => void;
  onAddMapping?: (site: string, entity: string, property: string) => void;
  selectedSite?: string;
}

interface HierarchyNode {
  site: string;
  entities: {
    [entity: string]: {
      properties: {
        [property: string]: ValueMapping[];
      };
    };
  };
}

export default function ValueMappingHierarchyView({
  mappings,
  onEdit,
  onDelete,
  onReorder,
  onAddMapping,
  selectedSite,
}: ValueMappingHierarchyViewProps) {
  const [expandedSites, setExpandedSites] = useState<Set<string>>(new Set());
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set());
  const [expandedProperties, setExpandedProperties] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Build hierarchy from mappings
  const hierarchy: HierarchyNode[] = [];
  const siteMap = new Map<string, HierarchyNode>();

  for (const mapping of mappings) {
    if (!siteMap.has(mapping.valueSite)) {
      const node: HierarchyNode = {
        site: mapping.valueSite,
        entities: {},
      };
      siteMap.set(mapping.valueSite, node);
      hierarchy.push(node);
    }

    const siteNode = siteMap.get(mapping.valueSite)!;
    if (!siteNode.entities[mapping.valueEntity]) {
      siteNode.entities[mapping.valueEntity] = { properties: {} };
    }

    const entityNode = siteNode.entities[mapping.valueEntity];
    if (!entityNode.properties[mapping.valueEntityProperty]) {
      entityNode.properties[mapping.valueEntityProperty] = [];
    }

    entityNode.properties[mapping.valueEntityProperty].push(mapping);
  }

  // Sort selectors within each property by selectorOrder
  for (const siteNode of hierarchy) {
    for (const entityNode of Object.values(siteNode.entities)) {
      for (const selectors of Object.values(entityNode.properties)) {
        selectors.sort((a, b) => a.selectorOrder - b.selectorOrder);
      }
    }
  }

  const toggleSite = (site: string) => {
    const newSet = new Set(expandedSites);
    if (newSet.has(site)) {
      newSet.delete(site);
    } else {
      newSet.add(site);
    }
    setExpandedSites(newSet);
  };

  const toggleEntity = (entity: string) => {
    const newSet = new Set(expandedEntities);
    const key = entity;
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setExpandedEntities(newSet);
  };

  const toggleProperty = (property: string) => {
    const newSet = new Set(expandedProperties);
    const key = property;
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setExpandedProperties(newSet);
  };

  if (mappings.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500 mb-4">No mappings configured</p>
        <p className="text-sm text-gray-400">Start by selecting HTML elements to map them to entity properties</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Value Mapping Hierarchy</h2>
        <p className="text-sm text-gray-600">
          Total: {mappings.length} selector{mappings.length !== 1 ? 's' : ''} across {hierarchy.length} site{hierarchy.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Hierarchy Tree */}
      <div className="divide-y divide-gray-200">
        {hierarchy.map((siteNode) => (
          <div key={siteNode.site}>
            {/* Site Level */}
            <button
              onClick={() => toggleSite(siteNode.site)}
              className="w-full text-left px-6 py-4 hover:bg-gray-50 transition flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg text-gray-600">
                  {expandedSites.has(siteNode.site) ? '▼' : '▶'}
                </span>
                <span className="font-semibold text-gray-900">{siteNode.site}</span>
                <span className="text-sm text-gray-500">
                  ({Object.keys(siteNode.entities).length} entities)
                </span>
              </div>
            </button>

            {/* Entities */}
            {expandedSites.has(siteNode.site) && (
              <div className="bg-gray-50">
                {Object.entries(siteNode.entities).map(([entity, entityNode]) => (
                  <div key={entity} className="border-t border-gray-200">
                    {/* Entity Level */}
                    <button
                      onClick={() => toggleEntity(entity)}
                      className="w-full text-left px-10 py-3 hover:bg-gray-100 transition flex items-center gap-2"
                    >
                      <span className="text-gray-600">
                        {expandedEntities.has(entity) ? '▼' : '▶'}
                      </span>
                      <span className="font-medium text-gray-900">{entity}</span>
                      <span className="text-sm text-gray-500">
                        ({Object.keys(entityNode.properties).length} properties)
                      </span>
                    </button>

                    {/* Properties */}
                    {expandedEntities.has(entity) && (
                      <div className="bg-white">
                        {Object.entries(entityNode.properties).map(([property, selectors]) => (
                          <div key={property} className="border-t border-gray-100">
                            {/* Property Level */}
                            <button
                              onClick={() => toggleProperty(property)}
                              className="w-full text-left px-14 py-2 hover:bg-gray-50 transition flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600 text-sm">
                                  {expandedProperties.has(property) ? '▼' : '▶'}
                                </span>
                                <span className="text-gray-900">{property}</span>
                                <span className="text-xs text-gray-500">
                                  ({selectors.length} selector{selectors.length !== 1 ? 's' : ''})
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddMapping?.(siteNode.site, entity, property);
                                }}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition"
                                title="Add new selector"
                              >
                                + Selector
                              </button>
                            </button>

                            {/* Selectors */}
                            {expandedProperties.has(property) && (
                              <div className="bg-blue-50 border-t border-gray-100">
                                {selectors.map((selector, index) => (
                                  <div
                                    key={selector.id}
                                    className="px-16 py-3 border-t border-gray-100 flex items-start justify-between hover:bg-blue-100 transition group"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="inline-flex items-center justify-center w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full">
                                          {selector.selectorOrder}
                                        </span>
                                        <code className="text-xs font-mono bg-gray-800 text-gray-100 px-2 py-1 rounded overflow-x-auto">
                                          {selector.cssSelector}
                                        </code>
                                      </div>
                                      {selector.selectorDescription && (
                                        <p className="text-xs text-gray-600 ml-7">{selector.selectorDescription}</p>
                                      )}
                                    </div>
                                    <div className="flex gap-2 ml-2 opacity-0 group-hover:opacity-100 transition">
                                      <button
                                        onClick={() => onEdit(selector)}
                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition whitespace-nowrap"
                                        title="Edit selector"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirm(selector.id)}
                                        className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition whitespace-nowrap"
                                        title="Delete selector"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this selector? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(deleteConfirm);
                  setDeleteConfirm(null);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
