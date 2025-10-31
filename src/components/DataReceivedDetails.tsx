"use client";

import { useState, useMemo, useEffect } from "react";
import HtmlViewer from "./HtmlViewer";
import ValueMappingWorkspace from "./ValueMappingWorkspace";
import DataReceivedInspector from "./DataReceivedInspector";
import { parseHtml, htmlToPlainText, parseVisualSections } from "@/lib/htmlParser";
import { extractDescriptionDetails } from "@/lib/listingDescriptionExtractor";
import type { DataReceivedDTO } from "@/dto/dataReceived.dto";

type DataReceived = DataReceivedDTO;

interface DataReceivedDetailsProps {
  item: DataReceived | null;
  onClose: () => void;
}

export default function DataReceivedDetails({ item, onClose }: DataReceivedDetailsProps) {
  const [reprocessing, setReprocessing] = useState(false);
  const [showHtmlViewer, setShowHtmlViewer] = useState(false);
  const [showSections, setShowSections] = useState(false);
  const [showExtractedDetails, setShowExtractedDetails] = useState(false);
  const [showMappingWorkspace, setShowMappingWorkspace] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const [mappings, setMappings] = useState<Record<string, unknown>[]>([]);
  const [mappingsLoading, setMappingsLoading] = useState(false);

  // Load mappings when workspace is opened
  useEffect(() => {
    if (!showMappingWorkspace || !item) return;

    const loadMappings = async () => {
      try {
        setMappingsLoading(true);
        const response = await fetch('/api/mappings');
        if (response.ok) {
          const data = await response.json();
          setMappings(data);
        }
      } catch (error) {
        console.error('Failed to load mappings:', error);
      } finally {
        setMappingsLoading(false);
      }
    };

    loadMappings();
  }, [showMappingWorkspace]);

  const handleSaveMapping = async (mappingData: Record<string, unknown>) => {
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
        alert('Mapping saved successfully');
      } else {
        alert('Failed to save mapping');
      }
    } catch (error) {
      console.error('Failed to save mapping:', error);
      alert('Failed to save mapping');
    }
  };

  const handleReprocess = async () => {
    setReprocessing(true);
    try {
      const response = await fetch("/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "processHtml",
          payload: {
            dataReceivedId: item.id,
            url: item.url,
            title: item.title
          }
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create reprocessing event");
      }

      alert("Reprocessing triggered successfully");
    } catch (error) {
      console.error("Reprocessing error:", error);
      alert("Failed to trigger reprocessing");
    } finally {
      setReprocessing(false);
    }
  };

  const formattedHtml = useMemo(() => {
    if (!item.html) return null;
    const nodes = parseHtml(item.html);
    return htmlToPlainText(nodes);
  }, [item.html]);

  const displayData = {
    ...item,
    html: formattedHtml,
    receivedAt: new Date(item.receivedAt * 1000).toLocaleString(),
  };
  
  const entries = Object.entries(displayData).filter(([key, value]) => value !== undefined && value !== null);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl border border-purple-400/30 shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-br from-slate-800 to-purple-900 border-b border-purple-400/30 p-6 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white">Details</h3>
          <div className="flex items-center gap-3">
            {item.html && (
              <>
                <button
                  onClick={() => setShowInspector(true)}
                  className="p-2 bg-blue-500/30 hover:bg-blue-500/50 rounded-lg border border-blue-400/30 transition-colors"
                  title="Open DOM Inspector"
                >
                  <svg
                    className="w-5 h-5 text-blue-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setShowExtractedDetails(true)}
                  className="p-2 bg-purple-500/30 hover:bg-purple-500/50 rounded-lg border border-purple-400/30 transition-colors"
                  title="View Extracted Details"
                >
                  <svg
                    className="w-5 h-5 text-purple-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setShowSections(true)}
                  className="p-2 bg-purple-500/30 hover:bg-purple-500/50 rounded-lg border border-purple-400/30 transition-colors"
                  title="View Sections"
                >
                  <svg
                    className="w-5 h-5 text-purple-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setShowHtmlViewer(true)}
                  className="p-2 bg-purple-500/30 hover:bg-purple-500/50 rounded-lg border border-purple-400/30 transition-colors"
                  title="View HTML"
                >
                  <svg
                    className="w-5 h-5 text-purple-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setShowMappingWorkspace(true)}
                  className="p-2 bg-purple-500/30 hover:bg-purple-500/50 rounded-lg border border-purple-400/30 transition-colors"
                  title="Map Elements"
                >
                  <svg
                    className="w-5 h-5 text-purple-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </button>
              </>
            )}
            <button
              onClick={handleReprocess}
              disabled={reprocessing}
              className="p-2 bg-purple-500/30 hover:bg-purple-500/50 rounded-lg border border-purple-400/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reprocess"
            >
              <svg
                className={`w-5 h-5 text-purple-300 ${reprocessing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-purple-300 hover:text-white transition-colors text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-6 space-y-3">
          {entries.map(([key, value]) => (
            <div
              key={key}
              className="bg-white/5 rounded-lg p-4 border border-white/10"
            >
              <div className="text-purple-300 text-sm font-semibold mb-1 uppercase tracking-wide">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className="text-white break-words">
                {typeof value === 'string' && value.length > 200 ? (
                  <div className="text-sm font-mono bg-black/20 p-3 rounded overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {value}
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{String(value)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {showInspector && item.html && (
        <DataReceivedInspector 
          dataReceivedId={item.id}
          html={item.html}
          url={item.url}
          onClose={() => setShowInspector(false)} 
        />
      )}
      {showHtmlViewer && item.html && (
        <HtmlViewer html={item.html} onClose={() => setShowHtmlViewer(false)} />
      )}
      {showSections && item.html && (
        <SectionsViewer html={item.html} onClose={() => setShowSections(false)} />
      )}
      {showExtractedDetails && item.html && (
        <ExtractedDetailsViewer html={item.html} onClose={() => setShowExtractedDetails(false)} />
      )}
      {showMappingWorkspace && item.html && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
          onClick={() => setShowMappingWorkspace(false)}
        >
          <div
            className="bg-gray-900 shadow-2xl w-full h-full flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 'calc(100vw - 2rem)', maxHeight: 'calc(100vh - 2rem)' }}
          >
            <div className="bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-center flex-shrink-0">
              <h3 className="text-2xl font-bold text-white">Map Elements</h3>
              <button
                onClick={() => setShowMappingWorkspace(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ValueMappingWorkspace
                html={item.html}
                mappings={mappings}
                onSaveMapping={handleSaveMapping}
                loading={mappingsLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionsViewer({ html, onClose }: { html: string; onClose: () => void }) {
  const sections = useMemo(() => {
    const nodes = parseHtml(html);
    if (nodes.length === 0) return [];
    return parseVisualSections(nodes[0]);
  }, [html]);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl border border-purple-400/30 shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-slate-800 to-purple-900 border-b border-purple-400/30 p-6 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white">Visual Sections</h3>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          {sections.length === 0 ? (
            <div className="text-purple-300 text-center py-8">No sections detected</div>
          ) : (
            sections.map((section, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-purple-400 text-xs font-semibold uppercase tracking-wide px-2 py-1 bg-purple-500/20 rounded">
                    {section.type}
                  </span>
                  {section.label && (
                    <span className="text-purple-300 font-semibold">
                      {section.label}
                    </span>
                  )}
                  <span className="text-purple-400 text-xs ml-auto">
                    {Math.round(section.confidence * 100)}% confidence
                  </span>
                </div>
                <div className="text-white text-sm bg-black/20 p-3 rounded whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {section.content}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ExtractedDetailsViewer({ html, onClose }: { html: string; onClose: () => void }) {
  const extractedDetails = useMemo(() => {
    const nodes = parseHtml(html);
    if (nodes.length === 0) return { requirements: [], responsibilities: [], benefits: [] };
    const sections = parseVisualSections(nodes[0]);
    return extractDescriptionDetails(sections);
  }, [html]);

  const hasAnyContent = extractedDetails.requirements.length > 0 || 
                       extractedDetails.responsibilities.length > 0 || 
                       extractedDetails.benefits.length > 0;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl border border-purple-400/30 shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-slate-800 to-purple-900 border-b border-purple-400/30 p-6 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white">Extracted Details</h3>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
          {!hasAnyContent ? (
            <div className="text-purple-300 text-center py-8">No details extracted</div>
          ) : (
            <>
              {extractedDetails.requirements.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-purple-300 font-semibold text-lg mb-3">Requirements</h4>
                  <ul className="space-y-2">
                    {extractedDetails.requirements.map((item, index) => (
                      <li key={index} className="text-white text-sm flex gap-2">
                        <span className="text-purple-400 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {extractedDetails.responsibilities.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-purple-300 font-semibold text-lg mb-3">Responsibilities</h4>
                  <ul className="space-y-2">
                    {extractedDetails.responsibilities.map((item, index) => (
                      <li key={index} className="text-white text-sm flex gap-2">
                        <span className="text-purple-400 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {extractedDetails.benefits.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-purple-300 font-semibold text-lg mb-3">Benefits</h4>
                  <ul className="space-y-2">
                    {extractedDetails.benefits.map((item, index) => (
                      <li key={index} className="text-white text-sm flex gap-2">
                        <span className="text-purple-400 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
