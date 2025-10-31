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
  const containerRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);

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

  // Initialize shadow DOM and render HTML
  useEffect(() => {
    if (!containerRef.current) return;

    // Handle existing shadow root - can't attach a new one if one exists
    if (shadowRootRef.current) {
      // Clear the existing shadow root's content
      while (shadowRootRef.current.firstChild) {
        shadowRootRef.current.removeChild(shadowRootRef.current.firstChild);
      }
    } else {
      // Only attach a new shadow root if one doesn't exist
      const newShadowRoot = containerRef.current.attachShadow({ mode: "open" });
      shadowRootRef.current = newShadowRoot;
    }

    const shadowRoot = shadowRootRef.current;

    // Add base styles to shadow DOM
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      
      * {
        box-sizing: border-box;
      }
      
      body {
        margin: 0;
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #1f2937;
        background: #ffffff;
      }
      
      /* Base element styling */
      h1, h2, h3, h4, h5, h6 {
        margin: 1.2em 0 0.6em 0;
        font-weight: 600;
      }
      
      p {
        margin: 0.8em 0;
      }
      
      ul, ol {
        margin: 0.8em 0;
        padding-left: 2em;
      }
      
      li {
        margin: 0.4em 0;
      }
      
      /* Selection highlight - blue outline */
      [data-node-path].inspector-selected {
        outline: 2px solid #2563eb !important;
        outline-offset: 2px;
        background-color: rgba(37, 99, 235, 0.05) !important;
      }
      
      /* Hover state - subtle background */
      [data-node-path].inspector-hoverable {
        transition: background-color 0.15s ease-in-out;
      }
      
      [data-node-path].inspector-hoverable:hover:not(.inspector-selected) {
        background-color: rgba(59, 130, 246, 0.08) !important;
      }
    `;
    shadowRoot.appendChild(styleSheet);

    // Create wrapper for HTML content
    const wrapper = document.createElement("div");
    wrapper.innerHTML = htmlWithPaths.current;
    shadowRoot.appendChild(wrapper);

    // Set up click tracking
    const handleElementClick = (event: Event) => {
      const target = event.target as HTMLElement;

      // Find the closest element with data-node-path attribute
      const nodePathEl = target.closest("[data-node-path]");
      if (nodePathEl && nodePathEl instanceof HTMLElement) {
        const nodePath = nodePathEl.getAttribute("data-node-path");
        if (nodePath) {
          // Remove previous selection highlight
          const previousSelected = shadowRoot.querySelector(
            ".inspector-selected"
          );
          if (previousSelected) {
            previousSelected.classList.remove("inspector-selected");
          }

          // Add highlight to new selection
          nodePathEl.classList.add("inspector-selected");

          // Call parent callback with node path
          onElementClick(nodePath);

          // Prevent event from bubbling to parent elements
          event.stopPropagation();
        }
      }
    };

    // Add click listener to shadow DOM
    wrapper.addEventListener("click", handleElementClick, true);

    // Add hover effect to all elements with node paths
    const addHoverEffect = (el: Element) => {
      if (el.hasAttribute("data-node-path")) {
        el.classList.add("inspector-hoverable");
      }
      // Recursively add to children
      for (let i = 0; i < el.children.length; i++) {
        addHoverEffect(el.children[i]);
      }
    };
    addHoverEffect(wrapper);

    return () => {
      wrapper.removeEventListener("click", handleElementClick, true);
    };
  }, [html, onElementClick]);

  // Handle external selection (when parent sets selectedNodePath)
  useEffect(() => {
    if (!shadowRootRef.current || !selectedNodePath) return;

    // Clear previous selection
    const previousSelected = shadowRootRef.current.querySelector(
      ".inspector-selected"
    );
    if (previousSelected) {
      previousSelected.classList.remove("inspector-selected");
    }

    // Find element with matching node path
    const selectedEl = shadowRootRef.current.querySelector(
      `[data-node-path="${selectedNodePath}"]`
    );
    if (selectedEl) {
      selectedEl.classList.add("inspector-selected");
      // Scroll into view
      selectedEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedNodePath]);

  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden border border-gray-200 flex flex-col">
      <div
        ref={containerRef}
        className="w-full flex-1 overflow-auto bg-white"
        style={{
          scrollBehavior: "smooth",
        }}
      />
    </div>
  );
}
