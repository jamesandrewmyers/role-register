'use client';

import { useState, useEffect, useCallback } from 'react';
import HtmlViewer from '@/components/HtmlViewer';
import ValueMappingForm from '@/components/ValueMappingForm';
import type { ValueMapping } from '@/domain/entities/valueMapping';

interface ValueMappingWorkspaceProps {
  html: string;
  mappings: ValueMapping[];
  onSaveMapping: (mappingData: any) => Promise<void>;
  loading?: boolean;
}

export default function ValueMappingWorkspace({
  html,
  mappings,
  onSaveMapping,
  loading = false,
}: ValueMappingWorkspaceProps) {
  const [selectedSelector, setSelectedSelector] = useState<string>('');
  const [sampleHtml, setSampleHtml] = useState<string>(html);

  useEffect(() => {
    setSampleHtml(html);
  }, [html]);

  const handleMapElement = useCallback((selector: string) => {
    setSelectedSelector(selector);
  }, []);

  const handleSaveMapping = useCallback(
    async (mappingData: any) => {
      try {
        await onSaveMapping(mappingData);
        // Reset form after successful save
        setSelectedSelector('');
      } catch (error) {
        console.error('Failed to save mapping:', error);
      }
    },
    [onSaveMapping]
  );

  const handleReset = useCallback(() => {
    setSelectedSelector('');
  }, []);

  return (
    <div className="flex h-full bg-gray-100">
      {/* Left side: HTML Viewer (70%) */}
      <div className="w-[70%] flex flex-col overflow-hidden">
        <HtmlViewer
          html={sampleHtml}
          isModal={false}
          onClose={() => {}} // No-op for embedded mode
          onMapElement={handleMapElement}
        />
      </div>

      {/* Divider */}
      <div className="w-1 bg-gray-300"></div>

      {/* Right side: Mapping Form (30%) */}
      <div className="w-[30%] flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading...
          </div>
        ) : (
          <ValueMappingForm
            cssSelector={selectedSelector}
            onSave={handleSaveMapping}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
