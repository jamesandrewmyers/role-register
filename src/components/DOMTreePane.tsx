"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { parseHtml, type HtmlNode } from "@/lib/htmlParser";

interface DOMTreePaneProps {
  htmlString: string;
  selectedNodePath?: string | null;
  onNodeSelect: (nodePath: string) => void;
}

/**
 * Recursive component to render a tree node
 */
function TreeNode({
  node,
  path,
  depth,
  selectedPath,
  onNodeSelect,
  expandedPaths,
  onToggleExpanded,
  treeContainerRef,
}: {
  node: HtmlNode;
  path: string;
  depth: number;
  selectedPath: string | null;
  onNodeSelect: (path: string) => void;
  expandedPaths: Set<string>;
  onToggleExpanded: (path: string) => void;
  treeContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const isSelected = path === selectedPath;
  const isExpanded = expandedPaths.has(path);
  const hasChildren = node.children && node.children.length > 0;
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeSelect(path);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpanded(path);
  };

  // Scroll to this node when selected
  useEffect(() => {
    if (isSelected && nodeRef.current && treeContainerRef.current) {
      nodeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isSelected, treeContainerRef]);

  if (node.type === "text") {
    const preview =
      node.content && node.content.length > 50
        ? node.content.substring(0, 50) + "..."
        : node.content;

    return (
      <div
        ref={nodeRef}
        data-path={path}
        style={{ paddingLeft: `${depth * 20}px` }}
        className={`py-1 px-3 text-sm font-mono cursor-pointer transition-colors ${
          isSelected
            ? "bg-blue-600/40 border-l-4 border-blue-400 text-blue-50"
            : "hover:bg-purple-500/10 text-gray-400"
        }`}
        onClick={handleNodeClick}
        title={node.content || ""}
      >
        <span className="text-gray-500">[text]</span>
        <span className="text-gray-400 ml-2">&quot;{preview}&quot;</span>
      </div>
    );
  }

  if (node.type === "element" && node.tag) {
    const attributes = node.attributes || {};
    const attrStrings: string[] = [];

    if (attributes.id) {
      attrStrings.push(`#${attributes.id}`);
    }
    if (attributes.class) {
      attrStrings.push(`.${attributes.class.split(" ").join(".")}`);
    }

    // Add other data-* attributes (limit to 2 to avoid clutter)
    let dataAttrs = 0;
    for (const [key, value] of Object.entries(attributes)) {
      if (key.startsWith("data-") && dataAttrs < 2) {
        const truncatedVal =
          value.length > 20 ? value.substring(0, 20) + "…" : value;
        attrStrings.push(`${key}="${truncatedVal}"`);
        dataAttrs++;
      }
    }

    const attrDisplay = attrStrings.length > 0 ? attrStrings.join(" ") : "";

    return (
      <>
        <div
          ref={nodeRef}
          data-path={path}
          style={{ paddingLeft: `${depth * 20}px` }}
          className={`py-1 px-3 text-sm font-mono cursor-pointer transition-colors ${
            isSelected
              ? "bg-blue-600/40 border-l-4 border-blue-400 text-blue-50"
              : "hover:bg-purple-500/10 text-gray-300"
          }`}
          onClick={handleNodeClick}
        >
          {hasChildren && (
            <span
              className="inline-block w-4 text-purple-400 font-bold cursor-pointer hover:text-purple-300 select-none"
              onClick={handleToggleExpand}
            >
              {isExpanded ? "−" : "+"}
            </span>
          )}
          {!hasChildren && <span className="inline-block w-4"></span>}

          <span className="text-blue-300">&lt;{node.tag}</span>
          {attrDisplay && (
            <span className="text-yellow-300 ml-1 text-xs">{attrDisplay}</span>
          )}
          <span className="text-blue-300">&gt;</span>

          {!hasChildren && <span className="text-blue-300">&lt;/{node.tag}&gt;</span>}
        </div>

        {hasChildren && isExpanded && (
          <>
            {node.children!.map((child, index) => (
              <TreeNode
                key={index}
                node={child}
                path={`${path}${path ? "." : ""}${index}`}
                depth={depth + 1}
                selectedPath={selectedPath}
                onNodeSelect={onNodeSelect}
                expandedPaths={expandedPaths}
                onToggleExpanded={onToggleExpanded}
                treeContainerRef={treeContainerRef}
              />
            ))}
            <div
              style={{ paddingLeft: `${depth * 20}px` }}
              className="py-1 px-3 text-sm font-mono text-blue-300"
            >
              &lt;/{node.tag}&gt;
            </div>
          </>
        )}
      </>
    );
  }

  return null;
}

export default function DOMTreePane({
  htmlString,
  selectedNodePath,
  onNodeSelect,
}: DOMTreePaneProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // Parse HTML into tree - MUST match the wrapping logic in VisualHTMLPane
  const root = useMemo(() => {
    const nodes = parseHtml(htmlString);
    // Same logic as VisualHTMLPane: wrap multiple roots in a div
    if (nodes.length === 1) {
      return nodes[0];
    }
    return {
      type: "element" as const,
      tag: "div",
      children: nodes,
    };
  }, [htmlString]);

  // Auto-expand all ancestors when node is selected
  useEffect(() => {
    if (!selectedNodePath) return;

    const newExpandedPaths = new Set<string>();
    
    // Always expand the root (empty string path)
    newExpandedPaths.add("");

    // Expand every ancestor node in the path
    const pathParts = selectedNodePath.split(".").filter((x) => x);
    for (let i = 0; i < pathParts.length; i++) {
      const ancestorPath = pathParts.slice(0, i + 1).join(".");
      newExpandedPaths.add(ancestorPath);
    }

    setExpandedPaths(newExpandedPaths);
  }, [selectedNodePath]);

  const handleToggleExpanded = (path: string) => {
    const newSet = new Set(expandedPaths);
    if (newSet.has(path)) {
      newSet.delete(path);
    } else {
      newSet.add(path);
    }
    setExpandedPaths(newSet);
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg border border-purple-400/20 overflow-hidden">
      {/* Tree Container */}
      <div
        ref={treeContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden text-white scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-transparent"
      >
        {root ? (
          <div className="py-2">
            <TreeNode
              node={root}
              path=""
              depth={0}
              selectedPath={selectedNodePath || null}
              onNodeSelect={onNodeSelect}
              expandedPaths={expandedPaths}
              onToggleExpanded={handleToggleExpanded}
              treeContainerRef={treeContainerRef}
            />
          </div>
        ) : (
          <div className="p-4 text-white/60 text-center">
            Failed to parse HTML
          </div>
        )}
      </div>

      {/* Status Bar */}
      {selectedNodePath && (
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-t border-purple-400/30 px-4 py-3 text-xs text-purple-200 font-mono">
          <div className="flex items-center justify-between">
            <span>
              <span className="text-purple-300">Path:</span> {selectedNodePath || "(root)"}
            </span>
            {selectedNodePath && (
              <span className="text-purple-300 text-xs opacity-75">
                [{selectedNodePath.split(".").length} levels]
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
