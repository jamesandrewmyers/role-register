"use client";

import { useState } from "react";

interface HtmlViewerProps {
  html: string;
  onClose: () => void;
}

interface HtmlNode {
  type: 'element' | 'text' | 'comment';
  tag?: string;
  content?: string;
  attributes?: Record<string, string>;
  children?: HtmlNode[];
}

function parseHtml(html: string): HtmlNode[] {
  const nodes: HtmlNode[] = [];
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
  const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
  
  let lastIndex = 0;
  let match;
  const stack: HtmlNode[] = [];
  let currentParent: HtmlNode[] = nodes;

  while ((match = tagRegex.exec(html)) !== null) {
    const textBefore = html.slice(lastIndex, match.index).trim();
    if (textBefore) {
      currentParent.push({ type: 'text', content: textBefore });
    }

    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = fullTag.startsWith('</');
    const isSelfClosing = selfClosingTags.includes(tagName) || fullTag.endsWith('/>');

    if (isClosing) {
      if (stack.length > 0) {
        const parent = stack.pop();
        if (parent && stack.length > 0) {
          currentParent = stack[stack.length - 1].children!;
        } else {
          currentParent = nodes;
        }
      }
    } else {
      const attrs: Record<string, string> = {};
      const attrRegex = /([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*["']([^"']*)["']/g;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(fullTag)) !== null) {
        attrs[attrMatch[1]] = attrMatch[2];
      }

      const node: HtmlNode = {
        type: 'element',
        tag: tagName,
        attributes: Object.keys(attrs).length > 0 ? attrs : undefined,
        children: []
      };

      currentParent.push(node);

      if (!isSelfClosing) {
        stack.push(node);
        currentParent = node.children!;
      }
    }

    lastIndex = match.index + fullTag.length;
  }

  const textAfter = html.slice(lastIndex).trim();
  if (textAfter) {
    currentParent.push({ type: 'text', content: textAfter });
  }

  return nodes;
}

function HtmlNodeView({ node, depth = 0 }: { node: HtmlNode; depth?: number }) {
  const [collapsed, setCollapsed] = useState(false);
  const indent = depth * 20;

  if (node.type === 'text') {
    const truncated = node.content && node.content.length > 100 
      ? node.content.slice(0, 100) + '...' 
      : node.content;
    return (
      <div style={{ marginLeft: `${indent}px` }} className="text-gray-400 text-sm py-0.5">
        {truncated}
      </div>
    );
  }

  if (node.type === 'element' && node.tag) {
    const hasChildren = node.children && node.children.length > 0;
    const attrString = node.attributes 
      ? ' ' + Object.entries(node.attributes)
          .map(([key, val]) => `${key}="${val}"`)
          .join(' ')
      : '';

    return (
      <div>
        <div 
          style={{ marginLeft: `${indent}px` }} 
          className="text-green-400 text-sm py-0.5 font-mono hover:bg-gray-800/50 cursor-pointer"
          onClick={() => hasChildren && setCollapsed(!collapsed)}
        >
          {hasChildren && (
            <span className="inline-block w-4 text-purple-400 font-bold">
              {collapsed ? '+' : '-'}
            </span>
          )}
          {!hasChildren && <span className="inline-block w-4"></span>}
          <span className="text-blue-400">&lt;{node.tag}</span>
          {attrString && <span className="text-yellow-400">{attrString}</span>}
          <span className="text-blue-400">&gt;</span>
          {!hasChildren && <span className="text-blue-400">&lt;/{node.tag}&gt;</span>}
        </div>
        {hasChildren && !collapsed && (
          <>
            {node.children!.map((child, idx) => (
              <HtmlNodeView key={idx} node={child} depth={depth + 1} />
            ))}
            <div style={{ marginLeft: `${indent}px` }} className="text-blue-400 text-sm py-0.5 font-mono">
              &lt;/{node.tag}&gt;
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
}

export default function HtmlViewer({ html, onClose }: HtmlViewerProps) {
  const nodes = parseHtml(html);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            HTML Viewer
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 bg-gray-950">
          {nodes.map((node, idx) => (
            <HtmlNodeView key={idx} node={node} />
          ))}
        </div>
      </div>
    </div>
  );
}
