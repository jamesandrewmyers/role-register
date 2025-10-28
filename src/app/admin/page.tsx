'use client';

import { useState, useEffect, useCallback } from 'react';
import HtmlViewer from '@/components/HtmlViewer';
import ValueMappingHierarchyView from '@/components/ValueMappingHierarchyView';
import ValueMappingDialog from '@/components/ValueMappingDialog';
import type { ValueMapping } from '@/domain/entities/valueMapping';

export default function AdminPage() {
  const [showHtmlViewer, setShowHtmlViewer] = useState(true);
  const [selectedSelector, setSelectedSelector] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mappings, setMappings] = useState<ValueMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [sampleHtml, setSampleHtml] = useState<string>('');

  // Load initial mappings
  useEffect(() => {
    const loadMappings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/mappings');
        if (response.ok) {
          const data = await response.json();
          setMappings(data);
        }
      } catch (error) {
        console.error('Failed to load mappings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMappings();
  }, []);

  // Load sample HTML (you can modify this to fetch from a URL)
  useEffect(() => {
    setSampleHtml(`
      <div class="container">
        <h1 id="job-title" class="job-header">Senior Developer Position</h1>
        <p class="location" data-testid="location">San Francisco, CA</p>
        <div class="salary-info">
          <span>$150,000 - $200,000</span>
        </div>
        <div class="description">
          <p>We are looking for a senior developer with experience in React and TypeScript.</p>
        </div>
      </div>
    `);
  }, []);

  const handleMapElement = useCallback((selector: string) => {
    setSelectedSelector(selector);
    setIsDialogOpen(true);
  }, []);

  const handleSaveMapping = useCallback(async (mappingData: any) => {
    try {
      const response = await fetch('/api/mappings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappingData),
      });

      if (response.ok) {
        const newMapping = await response.json();
        setMappings(prev => [...prev, newMapping]);
        setIsDialogOpen(false);
        setSelectedSelector(null);
      }
    } catch (error) {
      console.error('Failed to save mapping:', error);
    }
  }, []);

  const handleEditMapping = useCallback((mapping: ValueMapping | undefined) => {
    if (mapping) {
      setSelectedSelector(mapping.cssSelector);
      setIsDialogOpen(true);
    }
  }, []);

  const handleDeleteMapping = useCallback(async (mappingId: string) => {
    try {
      const response = await fetch(`/api/mappings/${mappingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMappings(prev => prev.filter(m => m.id !== mappingId));
      }
    } catch (error) {
      console.error('Failed to delete mapping:', error);
    }
  }, []);

  const handleReorderMapping = useCallback(
    async (mappingId: string, newOrder: number) => {
      try {
        const response = await fetch('/api/mappings/reorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mappingId, newOrder }),
        });

        if (response.ok) {
          // Refresh mappings after reorder
          const refreshResponse = await fetch('/api/mappings');
          if (refreshResponse.ok) {
            const updatedMappings = await refreshResponse.json();
            setMappings(updatedMappings);
          }
        }
      } catch (error) {
        console.error('Failed to reorder mapping:', error);
      }
    },
    []
  );

  const handleAddMapping = useCallback(() => {
    setSelectedSelector(null);
    setIsDialogOpen(true);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setShowHtmlViewer(false);
  }, []);

  return (
    <>
      <div data-testid="admin-main" className="grid grid-cols-2 gap-4 p-6">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mb-6">Value Mapping Admin</h1>

          <section className="flex-1 overflow-hidden">
            <h2 className="text-2xl font-semibold mb-4">HTML Viewer</h2>
            <div className="border border-gray-300 rounded-lg p-4 h-full flex items-center justify-center">
              <button
                onClick={() => setShowHtmlViewer(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Open HTML Viewer
              </button>
            </div>
          </section>
        </div>

        <div className="flex flex-col">
          <h2 className="text-2xl font-semibold mb-4">Mappings</h2>
          <section className="flex-1 overflow-auto border border-gray-300 rounded-lg p-4">
            {loading ? (
              <div className="text-center py-4">Loading mappings...</div>
            ) : (
              <ValueMappingHierarchyView
                mappings={mappings}
                onEdit={handleEditMapping}
                onDelete={handleDeleteMapping}
                onReorder={handleReorderMapping}
                onAddMapping={handleAddMapping}
              />
            )}
          </section>
        </div>

        <ValueMappingDialog
          isOpen={isDialogOpen}
          cssSelector={selectedSelector || ''}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedSelector(null);
          }}
          onSave={handleSaveMapping}
        />
      </div>

      {showHtmlViewer && (
        <HtmlViewer
          html={sampleHtml}
          onClose={handleCloseViewer}
          onMapElement={handleMapElement}
        />
      )}
    </>
  );
}
