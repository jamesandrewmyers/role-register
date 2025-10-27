'use client';

import { useState } from 'react';
import type { ValueMapping } from '@/domain/entities/valueMapping';

interface ValueMappingPropertyViewProps {
  site: string;
  entity: string;
  property: string;
  mappings: ValueMapping[];
  onEdit: (mapping: ValueMapping) => void;
  onDelete: (mappingId: string) => void;
  onReorder: (mappings: ValueMapping[]) => void;
  highlightedSelectorId?: string;
}

export default function ValueMappingPropertyView({
  site,
  entity,
  property,
  mappings,
  onEdit,
  onDelete,
  onReorder,
  highlightedSelectorId,
}: ValueMappingPropertyViewProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const getPriorityLabel = (order: number) => {
    if (order === 1) return 'Primary';
    if (order === 2) return 'Fallback';
    return `Priority ${order}`;
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    const newMappings = [...mappings];
    [newMappings[index], newMappings[index - 1]] = [newMappings[index - 1], newMappings[index]];
    
    // Swap order values
    const tempOrder = newMappings[index].selectorOrder;
    newMappings[index].selectorOrder = newMappings[index - 1].selectorOrder;
    newMappings[index - 1].selectorOrder = tempOrder;
    
    onReorder(newMappings);
  };

  const handleMoveDown = (index: number) => {
    if (index === mappings.length - 1) return;
    
    const newMappings = [...mappings];
    [newMappings[index], newMappings[index + 1]] = [newMappings[index + 1], newMappings[index]];
    
    // Swap order values
    const tempOrder = newMappings[index].selectorOrder;
    newMappings[index].selectorOrder = newMappings[index + 1].selectorOrder;
    newMappings[index + 1].selectorOrder = tempOrder;
    
    onReorder(newMappings);
  };

  const handleConfirmDelete = (mappingId: string) => {
    onDelete(mappingId);
    setDeleteConfirm(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {site} → {entity} → {property}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          CSS selectors for extracting {property} from {entity}
        </p>
      </div>

      {/* Empty State */}
      {mappings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No selectors configured for this property</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Add Selector
          </button>
        </div>
      ) : (
        /* Selectors List */
        <div className="space-y-4">
          {mappings.map((mapping, index) => (
            <div
              key={mapping.id}
              data-testid={`selector-row-${index}`}
              className={`p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition ${
                highlightedSelectorId === mapping.id ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
              }`}
              data-selected={highlightedSelectorId === mapping.id}
            >
              {/* Selector Order and Priority */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full">
                    {mapping.selectorOrder}
                  </span>
                  <span className="text-xs font-medium text-gray-600 px-2 py-1 bg-gray-200 rounded">
                    {getPriorityLabel(mapping.selectorOrder)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {/* Reorder Buttons */}
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="px-2 py-1 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition"
                    title="Move up"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === mappings.length - 1}
                    className="px-2 py-1 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition"
                    title="Move down"
                    aria-label="Move down"
                  >
                    ↓
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => onEdit(mapping)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition"
                    aria-label="Edit selector"
                  >
                    Edit
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setDeleteConfirm(mapping.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded transition"
                    aria-label="Delete selector"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* CSS Selector */}
              <div className="mb-2">
                <p className="text-xs font-semibold text-gray-600 mb-1">CSS Selector:</p>
                <code className="block bg-gray-800 text-gray-100 px-3 py-2 rounded text-sm font-mono overflow-x-auto">
                  {mapping.cssSelector}
                </code>
              </div>

              {/* Description */}
              {mapping.selectorDescription && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Description:</p>
                  <p className="text-sm text-gray-700">{mapping.selectorDescription}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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
                aria-label="Cancel delete"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
                aria-label="Confirm delete"
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
