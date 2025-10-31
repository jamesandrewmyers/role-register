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
  const [selectedEl, setSelectedEl] = useState<HTMLElement | null>(null);

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

  // Render HTML content
  useEffect(() => {
    if (!contentRef.current) return;

    // Set the HTML content
    contentRef.current.innerHTML = htmlWithPaths.current;

    // Set up click tracking
    const handleElementClick = (event: Event) => {
      const target = event.target as HTMLElement;

      // Find the closest element with data-node-path attribute
      const nodePathEl = target.closest("[data-node-path]");
      if (nodePathEl && nodePathEl instanceof HTMLElement) {
        const nodePath = nodePathEl.getAttribute("data-node-path");
        if (nodePath) {
          // Remove previous selection highlight
          if (selectedEl) {
            selectedEl.classList.remove("inspector-selected");
          }

          // Add highlight to new selection
          nodePathEl.classList.add("inspector-selected");
          setSelectedEl(nodePathEl);

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
  }, [html, onElementClick, selectedEl]);

  // Handle external selection (when parent sets selectedNodePath)
  useEffect(() => {
    if (!contentRef.current || !selectedNodePath) return;

    // Clear previous selection
    if (selectedEl) {
      selectedEl.classList.remove("inspector-selected");
    }

    // Find element with matching node path
    const selectedElement = contentRef.current.querySelector(
      `[data-node-path="${selectedNodePath}"]`
    ) as HTMLElement | null;

    if (selectedElement) {
      selectedElement.classList.add("inspector-selected");
      setSelectedEl(selectedElement);
      // Scroll into view
      selectedElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedNodePath, selectedEl]);

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg overflow-hidden border border-gray-200">
      <div
        ref={contentRef}
        className="flex-1 overflow-auto p-8"
        style={{
          scrollBehavior: "smooth",
          color: "#1f2937",
        }}
      >
        {/* Content will be rendered here via innerHTML */}
      </div>
      <style>{`
        [data-node-path] {
          transition: all 0.15s ease-in-out;
          cursor: pointer;
        }

        [data-node-path]:hover {
          background-color: rgba(59, 130, 246, 0.1);
        }

        [data-node-path].inspector-selected {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
          background-color: rgba(37, 99, 235, 0.15);
        }

        /* Typography improvements */
        h1, h2, h3, h4, h5, h6 {
          color: #111827;
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
        }

        ul, ol {
          margin: 1em 0;
          padding-left: 2em;
          line-height: 1.7;
        }

        li {
          margin: 0.5em 0;
        }

        a {
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
        }

        a:hover {
          text-decoration: underline;
        }

        strong, b {
          font-weight: 600;
          color: #111827;
        }

        em, i {
          font-style: italic;
        }

        code {
          background-color: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          font-family: monospace;
          font-size: 0.9em;
        }

        pre {
          background-color: #1f2937;
          color: #e5e7eb;
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
          margin: 1em 0;
        }

        blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1em;
          margin-left: 0;
          color: #6b7280;
          font-style: italic;
        }

        table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }

        table td, table th {
          border: 1px solid #e5e7eb;
          padding: 0.75em;
          text-align: left;
        }

        table th {
          background-color: #f9fafb;
          font-weight: 600;
        }

        hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 2em 0;
        }

        img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5em;
        }
      `}</style>
    </div>
  );
}
