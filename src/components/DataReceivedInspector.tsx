"use client";

import { useState } from "react";
import VisualHTMLPane from "./VisualHTMLPane";
import DOMTreePane from "./DOMTreePane";

interface DataReceivedInspectorProps {
  dataReceivedId: string;
  html: string;
  url: string;
  onClose: () => void;
}

export default function DataReceivedInspector({
  html,
  url,
  onClose,
}: DataReceivedInspectorProps) {
  const [selectedNodePath, setSelectedNodePath] = useState<string | null>(null);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl border border-purple-400/30 shadow-2xl w-[95%] h-[95%] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-slate-800 to-purple-900 border-b border-purple-400/30 px-6 py-4 flex justify-between items-start flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-white truncate">
              DOM Inspector
            </h3>
            <p className="text-purple-300 text-xs mt-2 truncate font-mono opacity-75">
              {url}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white transition-colors text-3xl leading-none ml-6 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded hover:bg-purple-500/20"
            title="Close inspector"
          >
            ×
          </button>
        </div>

        {/* Main Content - Two Panes */}
        <div className="flex-1 flex overflow-hidden gap-0">
          {/* Left Pane: Visual HTML (60%) */}
          <div className="w-3/5 flex flex-col overflow-hidden border-r-2 border-purple-400/30">
            <div className="px-6 pt-5 pb-3 border-b border-purple-400/20 bg-slate-800/50">
              <div className="text-purple-300 text-xs font-semibold uppercase tracking-widest">
                Rendered HTML
              </div>
            </div>
            <div className="flex-1 px-6 py-6 overflow-hidden">
              <VisualHTMLPane
                html={html}
                selectedNodePath={selectedNodePath}
                onElementClick={(nodePath) => setSelectedNodePath(nodePath)}
              />
            </div>
          </div>

          {/* Right Pane: DOM Tree (40%) */}
          <div className="w-2/5 flex flex-col overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-purple-400/20 bg-slate-800/50">
              <div className="text-purple-300 text-xs font-semibold uppercase tracking-widest">
                DOM Tree
              </div>
            </div>
            <div className="flex-1 px-6 py-6 overflow-hidden">
              <DOMTreePane
                htmlString={html}
                selectedNodePath={selectedNodePath}
                onNodeSelect={(nodePath) => setSelectedNodePath(nodePath)}
              />
            </div>
          </div>
        </div>

        {/* Status Bar */}
        {selectedNodePath && (
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-t border-purple-400/30 px-6 py-3 flex items-center justify-between text-sm text-purple-200">
            <div className="font-mono text-xs">
              <span className="text-purple-300">Path:</span> {selectedNodePath || "(root)"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
