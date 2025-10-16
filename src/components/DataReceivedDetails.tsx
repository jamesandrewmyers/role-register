"use client";

import { useState, useMemo } from "react";
import HtmlViewer from "./HtmlViewer";
import { parseHtml, htmlToPlainText, parseVisualSections } from "@/lib/htmlParser";
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

  if (!item) return null;

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
      {showHtmlViewer && item.html && (
        <HtmlViewer html={item.html} onClose={() => setShowHtmlViewer(false)} />
      )}
      {showSections && item.html && (
        <SectionsViewer html={item.html} onClose={() => setShowSections(false)} />
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
