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

    // Set the HTML content (without trying to inject styles via string replacement)
    contentRef.current.innerHTML = htmlWithPaths.current;

    // Create and inject a style element directly into the DOM with scoped selectors
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      [data-visual-pane-container] .visually-hidden { display: none !important; }
      [data-visual-pane-container] img { max-width: 100% !important; height: auto !important; }
      [data-visual-pane-container] button {
        background-color: #3b82f6 !important;
        color: #ffffff !important;
        border: 1px solid #1e40af !important;
        padding: 0.35em 0.75em !important;
        margin: 0.25em 0 !important;
        border-radius: 0.375em !important;
        cursor: not-allowed !important;
        font-weight: 500 !important;
        font-size: 0.95em !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 0.5em !important;
        line-height: 1.2 !important;
        height: auto !important;
        min-height: auto !important;
        white-space: nowrap !important;
      }
      [data-visual-pane-container] button:hover { background-color: #2563eb !important; }
      [data-visual-pane-container] button:active { background-color: #1d4ed8 !important; }
      [data-visual-pane-container] input, [data-visual-pane-container] select, [data-visual-pane-container] textarea { pointer-events: none !important; }
      [data-visual-pane-container] a { pointer-events: none !important; }
      [data-visual-pane-container] ul { list-style: disc !important; margin-left: 2em !important; }
      [data-visual-pane-container] ol { list-style: decimal !important; margin-left: 2em !important; }
      [data-visual-pane-container] li { display: list-item !important; }
    `;
    contentRef.current.appendChild(styleElement);

    // Add onclick handlers to all buttons to prevent their default behavior
    const buttons = contentRef.current.querySelectorAll("button");
    buttons.forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };

      // Detect empty buttons and add visual indicator
      if (!btn.textContent?.trim() && !btn.innerHTML.includes("svg")) {
        btn.setAttribute("data-empty", "true");
        btn.textContent = "Button";
      }
    });

    // Add error handlers to images
    const images = contentRef.current.querySelectorAll("img");
    images.forEach((img) => {
      img.addEventListener("error", () => {
        img.setAttribute("data-broken", "true");
      });
    });

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

          // Prevent event from bubbling
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
        data-visual-pane-container
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
      `}</style>
    </div>
  );
}
