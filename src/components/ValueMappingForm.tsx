'use client';

import { useState } from 'react';

interface ValueMappingFormProps {
  cssSelector: string;
  onSave: (mapping: ValueMappingData) => void;
  onReset?: () => void;
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

export default function ValueMappingForm({
  cssSelector,
  onSave,
  onReset,
}: ValueMappingFormProps) {
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
      selectorOrder: 1,
    });

    setValueSite('');
    setValueEntity('');
    setValueEntityProperty('');
    setSelectorDescription('');
  };

  const handleReset = () => {
    setError('');
    setValueSite('');
    setValueEntity('');
    setValueEntityProperty('');
    setSelectorDescription('');
    onReset?.();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-800 to-purple-900 p-6">
      <h2 className="text-xl font-bold text-white mb-4">Map HTML Element to Entity</h2>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* CSS Selector Display */}
        <div>
          <label className="block text-sm font-medium text-purple-300 mb-2">
            CSS Selector
          </label>
          <input
            type="text"
            value={cssSelector}
            readOnly
            className="w-full px-3 py-2 border border-purple-400/30 rounded-lg bg-black/20 font-mono text-sm text-white placeholder-gray-500"
          />
        </div>

        {/* Source Site Selection */}
        <div>
          <label htmlFor="site-select" className="block text-sm font-medium text-purple-300 mb-2">
            Source Site
          </label>
          <select
            id="site-select"
            value={valueSite}
            onChange={(e) => setValueSite(e.target.value)}
            className="w-full px-3 py-2 border border-purple-400/30 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="" className="bg-slate-900">Select a site...</option>
            {SITES.map((site) => (
              <option key={site} value={site} className="bg-slate-900">
                {site}
              </option>
            ))}
          </select>
        </div>

        {/* Entity Selection */}
        <div>
          <label htmlFor="entity-select" className="block text-sm font-medium text-purple-300 mb-2">
            Entity
          </label>
          <select
            id="entity-select"
            value={valueEntity}
            onChange={(e) => setValueEntity(e.target.value)}
            className="w-full px-3 py-2 border border-purple-400/30 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="" className="bg-slate-900">Select an entity...</option>
            {entityOptions.map((entity) => (
              <option key={entity} value={entity} className="bg-slate-900">
                {entity}
              </option>
            ))}
          </select>
        </div>

        {/* Entity Property Selection */}
        <div>
          <label htmlFor="property-select" className="block text-sm font-medium text-purple-300 mb-2">
            Entity Property
          </label>
          <select
            id="property-select"
            value={valueEntityProperty}
            onChange={(e) => setValueEntityProperty(e.target.value)}
            disabled={!valueEntity}
            className="w-full px-3 py-2 border border-purple-400/30 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="" className="bg-slate-900">Select a property...</option>
            {propertyOptions.map((prop) => (
              <option key={prop} value={prop} className="bg-slate-900">
                {prop}
              </option>
            ))}
          </select>
        </div>

        {/* Selector Description (Optional) */}
        <div>
          <label htmlFor="description-input" className="block text-sm font-medium text-purple-300 mb-2">
            Description (Optional)
          </label>
          <input
            id="description-input"
            type="text"
            value={selectorDescription}
            onChange={(e) => setSelectorDescription(e.target.value)}
            placeholder="e.g., Primary title selector, LinkedIn variant"
            className="w-full px-3 py-2 border border-purple-400/30 rounded-lg bg-black/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6 pt-4 border-t border-purple-400/30">
        <button
          onClick={handleReset}
          className="flex-1 px-4 py-2 text-purple-300 border border-purple-400/30 rounded-lg hover:bg-purple-500/20 font-medium transition"
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition"
        >
          Save Mapping
        </button>
      </div>
    </div>
  );
}
