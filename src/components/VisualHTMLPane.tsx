"use client";

import { useState, useRef, useEffect } from "react";
import { parseHtml, type HtmlNode } from "@/lib/htmlParser";

interface VisualHTMLPaneProps {
  html: string;
  selectedNodePath?: string;
  onElementClick: (nodePath: string) => void;
}

/**
 * Add data-node-path attributes to elements in the HTML tree
 * This allows us to track which tree node corresponds to each visual element
 */
function addNodePathAttributes(node: HtmlNode, path: string = ""): string {
  if (node.type === "text") {
    return node.content || "";
  }

  if (node.type === "element" && node.tag) {
    const attrs = node.attributes || {};
    const attrString = Object.entries(attrs)
      .map(([key, value]) => {
        // Escape quotes in attribute values
        const escaped = String(value).replace(/"/g, "&quot;");
        return `${key}="${escaped}"`;
      })
      .join(" ");

    const openTag = attrString
      ? `<${node.tag} data-node-path="${path}" ${attrString}>`
      : `<${node.tag} data-node-path="${path}">`;

    const children = node.children
      ? node.children
          .map((child, index) =>
            addNodePathAttributes(child, `${path}${path ? "." : ""}${index}`)
          )
          .join("")
      : "";

    const closeTag = `</${node.tag}>`;

    return openTag + children + closeTag;
  }

  return "";
}

export default function VisualHTMLPane({
  html,
  selectedNodePath,
  onElementClick,
}: VisualHTMLPaneProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const selectedElRef = useRef<HTMLElement | null>(null);
  const selectedNodePathRef = useRef<string | null>(null);

  // Parse HTML and add node path attributes
  const htmlWithPaths = useRef<string>("");
  useEffect(() => {
    const nodes = parseHtml(html);
    // Create wrapper if multiple root nodes
    const root =
      nodes.length === 1
        ? nodes[0]
        : ({
            type: "element" as const,
            tag: "div",
            children: nodes,
          } as HtmlNode);
    htmlWithPaths.current = addNodePathAttributes(root);
  }, [html]);

  // Render HTML content and set up click tracking
  useEffect(() => {
    if (!contentRef.current) return;

    // Set the HTML content
    contentRef.current.innerHTML = htmlWithPaths.current;

    // Re-apply selection if we have one stored
    if (selectedNodePathRef.current) {
      const selectedElement = contentRef.current.querySelector(
        `[data-node-path="${selectedNodePathRef.current}"]`
      ) as HTMLElement | null;

      if (selectedElement) {
        selectedElement.classList.add("inspector-selected");
        selectedElRef.current = selectedElement;
      }
    }

    // Set up click tracking
    const handleElementClick = (event: Event) => {
      const target = event.target as HTMLElement;

      // Find the closest element with data-node-path attribute
      const nodePathEl = target.closest("[data-node-path]");
      if (nodePathEl && nodePathEl instanceof HTMLElement) {
        const nodePath = nodePathEl.getAttribute("data-node-path");
        if (nodePath) {
          // Clear all inspector-selected classes first
          if (contentRef.current) {
            contentRef.current
              .querySelectorAll(".inspector-selected")
              .forEach((el) => el.classList.remove("inspector-selected"));
          }

          // Add highlight to new selection
          nodePathEl.classList.add("inspector-selected");
          selectedElRef.current = nodePathEl;
          selectedNodePathRef.current = nodePath;

          // Call parent callback with node path
          onElementClick(nodePath);

          // Prevent event from bubbling to parent elements
          event.stopPropagation();
        }
      }
    };

    // Add click listener
    contentRef.current.addEventListener("click", handleElementClick, true);

    return () => {
      contentRef.current?.removeEventListener("click", handleElementClick, true);
    };
  }, [html, onElementClick]);

  // Handle external selection (when parent sets selectedNodePath)
  useEffect(() => {
    if (!contentRef.current || !selectedNodePath) return;

    // Store the selected path so we can re-apply it if HTML re-renders
    selectedNodePathRef.current = selectedNodePath;

    // Clear all inspector-selected classes
    contentRef.current
      .querySelectorAll(".inspector-selected")
      .forEach((el) => el.classList.remove("inspector-selected"));

    // Find element with matching node path
    const selectedElement = contentRef.current.querySelector(
      `[data-node-path="${selectedNodePath}"]`
    ) as HTMLElement | null;

    if (selectedElement) {
      selectedElement.classList.add("inspector-selected");
      selectedElRef.current = selectedElement;
    }
  }, [selectedNodePath]);

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg overflow-hidden border border-purple-400/20">
      <div
        ref={contentRef}
        className="flex-1 overflow-auto p-8"
        style={{
          color: "#e5e7eb",
        }}
      >
        {/* Content will be rendered here via innerHTML */}
      </div>
      <style>{`
        [data-node-path] {
          transition: background-color 0.15s ease-in-out;
          cursor: pointer;
          position: relative;
        }

        [data-node-path].inspector-selected {
          background-color: rgba(37, 99, 235, 0.25) !important;
          box-shadow: inset 0 0 0 2px #2563eb !important;
          border-radius: 2px;
        }

        /* Typography improvements */
        h1, h2, h3, h4, h5, h6 {
          color: #f0f9ff;
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          line-height: 1.3;
        }

        h1 { font-size: 2em; }
        h2 { font-size: 1.5em; }
        h3 { font-size: 1.25em; }
        h4 { font-size: 1.1em; }
        h5 { font-size: 1em; }
        h6 { font-size: 0.9em; }

        p {
          margin: 1em 0;
          line-height: 1.7;
          color: #d1d5db;
        }

        ul, ol {
          margin: 1em 0;
          padding-left: 2em;
          line-height: 1.7;
          color: #d1d5db;
        }

        li {
          margin: 0.5em 0;
        }

        a {
          color: #60a5fa;
          text-decoration: none;
          font-weight: 500;
        }

        a:hover {
          text-decoration: underline;
          color: #93c5fd;
        }

        strong, b {
          font-weight: 600;
          color: #f0f9ff;
        }

        em, i {
          font-style: italic;
          color: #d1d5db;
        }

        code {
          background-color: #1f2937;
          color: #a7f3d0;
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          font-family: monospace;
          font-size: 0.9em;
        }

        pre {
          background-color: #0f172a;
          color: #e2e8f0;
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
          margin: 1em 0;
          border: 1px solid #334155;
        }

        blockquote {
          border-left: 4px solid #7c3aed;
          padding-left: 1em;
          margin-left: 0;
          color: #a78bfa;
          font-style: italic;
        }

        table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }

        table td, table th {
          border: 1px solid #475569;
          padding: 0.75em;
          text-align: left;
          color: #d1d5db;
        }

        table th {
          background-color: #1e293b;
          font-weight: 600;
          color: #f0f9ff;
        }

        hr {
          border: none;
          border-top: 1px solid #475569;
          margin: 2em 0;
        }

        img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5em;
          border: 1px solid #475569;
        }
      `}</style>
    </div>
  );
}
