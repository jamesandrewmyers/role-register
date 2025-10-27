'use client';

import { useState, useEffect } from 'react';

interface ValueMappingDialogProps {
  isOpen: boolean;
  cssSelector: string;
  onClose: () => void;
  onSave: (mapping: ValueMappingData) => void;
}

interface ValueMappingData {
  valueSite: string;
  valueEntity: string;
  valueEntityProperty: string;
  cssSelector: string;
  selectorDescription?: string;
  selectorOrder: number;
}

const SITES = ['indeed.com', 'linkedin.com'];

const ENTITIES = {
  roleListing: ['title', 'description', 'workArrangement', 'location'],
  roleEvent: ['eventType', 'eventTitle', 'eventDate', 'eventNotes'],
  roleContact: ['name', 'email', 'phone'],
  roleCallout: ['content'],
  roleLineItems: ['description', 'type'],
  roleCompany: ['name', 'website'],
  roleLocation: ['city', 'locationState'],
  roleState: ['name', 'abbreviation'],
};

export default function ValueMappingDialog({
  isOpen,
  cssSelector,
  onClose,
  onSave,
}: ValueMappingDialogProps) {
  const [valueSite, setValueSite] = useState('');
  const [valueEntity, setValueEntity] = useState('');
  const [valueEntityProperty, setValueEntityProperty] = useState('');
  const [selectorDescription, setSelectorDescription] = useState('');
  const [error, setError] = useState('');

  const entityOptions = Object.keys(ENTITIES);
  const propertyOptions = valueEntity ? ENTITIES[valueEntity as keyof typeof ENTITIES] || [] : [];

  const handleSave = () => {
    setError('');

    if (!valueSite) {
      setError('Please select a source site');
      return;
    }

    if (!valueEntity) {
      setError('Please select an entity');
      return;
    }

    if (!valueEntityProperty) {
      setError('Please select an entity property');
      return;
    }

    onSave({
      valueSite,
      valueEntity,
      valueEntityProperty,
      cssSelector,
      selectorDescription: selectorDescription || undefined,
      selectorOrder: 1, // For now, always 1. In a real scenario, calculate based on existing mappings
    });

    // Reset form
    setValueSite('');
    setValueEntity('');
    setValueEntityProperty('');
    setSelectorDescription('');
  };

  const handleCancel = () => {
    setError('');
    setValueSite('');
    setValueEntity('');
    setValueEntityProperty('');
    setSelectorDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Map HTML Element to Entity</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* CSS Selector Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CSS Selector
              </label>
              <input
                type="text"
                value={cssSelector}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
              />
            </div>

            {/* Source Site Selection */}
            <div>
              <label htmlFor="site-select" className="block text-sm font-medium text-gray-700 mb-1">
                Source Site
              </label>
              <select
                id="site-select"
                value={valueSite}
                onChange={(e) => setValueSite(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a site...</option>
                {SITES.map((site) => (
                  <option key={site} value={site}>
                    {site}
                  </option>
                ))}
              </select>
            </div>

            {/* Entity Selection */}
            <div>
              <label htmlFor="entity-select" className="block text-sm font-medium text-gray-700 mb-1">
                Entity
              </label>
              <select
                id="entity-select"
                value={valueEntity}
                onChange={(e) => setValueEntity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an entity...</option>
                {entityOptions.map((entity) => (
                  <option key={entity} value={entity}>
                    {entity}
                  </option>
                ))}
              </select>
            </div>

            {/* Entity Property Selection */}
            <div>
              <label htmlFor="property-select" className="block text-sm font-medium text-gray-700 mb-1">
                Entity Property
              </label>
              <select
                id="property-select"
                value={valueEntityProperty}
                onChange={(e) => setValueEntityProperty(e.target.value)}
                disabled={!valueEntity}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">Select a property...</option>
                {propertyOptions.map((prop) => (
                  <option key={prop} value={prop}>
                    {prop}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector Description (Optional) */}
            <div>
              <label htmlFor="description-input" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <input
                id="description-input"
                type="text"
                value={selectorDescription}
                onChange={(e) => setSelectorDescription(e.target.value)}
                placeholder="e.g., Primary title selector, LinkedIn variant"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              Save Mapping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
