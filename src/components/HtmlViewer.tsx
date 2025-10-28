"use client";

import { useState, useEffect, useRef } from "react";
import { parseHtml, type HtmlNode } from "@/lib/htmlParser";

interface HtmlViewerProps {
  html: string;
  onClose: () => void;
  onMapElement?: (selector: string) => void;
  isModal?: boolean;
}

interface ContextMenu {
  x: number;
  y: number;
  selector: string;
  visible: boolean;
}

const globalFirstMatch = { found: false };

/**
 * Generate a CSS selector for an HTML element
 * Priority: id > class > data-testid > tag
 */
function generateSelector(node: HtmlNode): string {
  if (node.type !== 'element' || !node.tag) return '';
  
  let selector = node.tag;
  
  if (node.attributes?.id) {
    return `#${node.attributes.id}`;
  }
  
  if (node.attributes?.class) {
    const classes = node.attributes.class.split(' ').slice(0, 2).join('.');
    return `${node.tag}.${classes}`;
  }
  
  if (node.attributes?.['data-testid']) {
    return `${node.tag}[data-testid="${node.attributes['data-testid']}"]`;
  }
  
  return selector;
}

function HtmlNodeView({ 
  node, 
  depth = 0, 
  searchTerm = '', 
  firstMatchTracker = globalFirstMatch,
  onElementContextMenu,
  selectedSelector,
}: { 
  node: HtmlNode; 
  depth?: number; 
  searchTerm?: string; 
  firstMatchTracker?: { found: boolean };
  onElementContextMenu?: (selector: string, x: number, y: number) => void;
  selectedSelector?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const indent = depth * 20;

  const highlightText = (text: string) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => {
          if (part.toLowerCase() === searchTerm.toLowerCase()) {
            const isFirstOccurrence = !firstMatchTracker.found;
            if (isFirstOccurrence) {
              firstMatchTracker.found = true;
            }
            return (
              <mark 
                key={i} 
                className="bg-yellow-400 text-black"
                {...(isFirstOccurrence ? { 'data-first-match': 'true' } : {})}
              >
                {part}
              </mark>
            );
          }
          return part;
        })}
      </>
    );
  };

  if (node.type === 'text') {
    const truncated = node.content && node.content.length > 100 
      ? node.content.slice(0, 100) + '...' 
      : node.content;
    return (
      <div style={{ marginLeft: `${indent}px` }} className="text-gray-400 text-sm py-0.5">
        {searchTerm ? highlightText(truncated || '') : truncated}
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

    const selector = generateSelector(node);
    const isSelected = selector === selectedSelector;

    return (
      <div>
        <div 
          style={{ marginLeft: `${indent}px` }} 
          className={`text-green-400 text-sm py-0.5 font-mono hover:bg-gray-800/50 cursor-pointer ${isSelected ? 'bg-purple-900/50 highlight' : ''}`}
          onClick={() => hasChildren && setCollapsed(!collapsed)}
          onContextMenu={(e) => {
            e.preventDefault();
            onElementContextMenu?.(selector, e.clientX, e.clientY);
          }}
        >
          {hasChildren && (
            <span className="inline-block w-4 text-purple-400 font-bold">
              {collapsed ? '+' : '-'}
            </span>
          )}
          {!hasChildren && <span className="inline-block w-4"></span>}
          <span className="text-blue-400">&lt;{searchTerm ? highlightText(node.tag) : node.tag}</span>
          {attrString && <span className="text-yellow-400">{searchTerm ? highlightText(attrString) : attrString}</span>}
          <span className="text-blue-400">&gt;</span>
          {!hasChildren && <span className="text-blue-400">&lt;/{searchTerm ? highlightText(node.tag) : node.tag}&gt;</span>}
        </div>
        {hasChildren && !collapsed && (
          <>
            {node.children!.map((child, idx) => (
              <HtmlNodeView 
                key={idx} 
                node={child} 
                depth={depth + 1} 
                searchTerm={searchTerm} 
                firstMatchTracker={firstMatchTracker}
                onElementContextMenu={onElementContextMenu}
                selectedSelector={selectedSelector}
              />
            ))}
            <div style={{ marginLeft: `${indent}px` }} className="text-blue-400 text-sm py-0.5 font-mono">
              &lt;/{searchTerm ? highlightText(node.tag) : node.tag}&gt;
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
}

export default function HtmlViewer({ html, onClose, onMapElement, isModal = true }: HtmlViewerProps) {
  const nodes = parseHtml(html);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [renderKey, setRenderKey] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [contextMenu, setContextMenu] = useState<ContextMenu>({ x: 0, y: 0, selector: '', visible: false });
  const [selectedSelector, setSelectedSelector] = useState<string>();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);
  const firstMatchTrackerRef = useRef({ found: false });

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setSearchTerm(searchInput);
      hasScrolledRef.current = false;
      firstMatchTrackerRef.current = { found: false };
      setRenderKey(prev => prev + 1);
      setCurrentMatchIndex(0);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchInput]);

  useEffect(() => {
    if (searchTerm && contentRef.current) {
      setTimeout(() => {
        const marks = contentRef.current?.querySelectorAll('mark');
        if (marks && marks.length > 0) {
          marks[currentMatchIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [searchTerm, currentMatchIndex]);

  const navigateToNextMatch = () => {
    if (!searchTerm || !contentRef.current) return;
    const marks = contentRef.current.querySelectorAll('mark');
    if (marks.length > 0) {
      const nextIndex = (currentMatchIndex + 1) % marks.length;
      setCurrentMatchIndex(nextIndex);
    }
  };

  const handleContextMenu = (selector: string, x: number, y: number) => {
    setContextMenu({ x, y, selector, visible: true });
    setSelectedSelector(selector);
  };

  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleMapElement = () => {
    if (onMapElement && contextMenu.selector) {
      onMapElement(contextMenu.selector);
    }
    closeContextMenu();
  };

  const handleCopySelector = async () => {
    try {
      await navigator.clipboard.writeText(contextMenu.selector);
      closeContextMenu();
    } catch (err) {
      console.error('Failed to copy selector:', err);
    }
  };

  const handleInspect = () => {
    // Highlight the element
    closeContextMenu();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
      if (e.key === 'Escape') {
        if (showSearch) {
          setShowSearch(false);
          setSearchInput('');
          setSearchTerm('');
          setCurrentMatchIndex(0);
        } else if (contextMenu.visible) {
          closeContextMenu();
        }
      }
      if (e.key === 'Enter' && showSearch && searchTerm) {
        e.preventDefault();
        navigateToNextMatch();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (contextMenu.visible && !target.closest('[role="menu"]')) {
        closeContextMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showSearch, searchTerm, currentMatchIndex, contextMenu.visible]);

  const content = (
    <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl w-full flex flex-col h-full">
      <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          HTML Viewer
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowSearch(!showSearch);
              if (!showSearch) {
                setTimeout(() => searchInputRef.current?.focus(), 0);
              }
            }}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Search (Ctrl+F)"
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>
      </div>
      {showSearch && (
        <div className="bg-gray-800 border-b border-gray-700 p-3">
          <input
            ref={searchInputRef}
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search HTML..."
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      )}
      <div ref={contentRef} className="p-6 overflow-y-auto flex-1 bg-gray-950" key={renderKey}>
        {nodes.map((node, idx) => (
          <HtmlNodeView
            key={idx}
            node={node}
            searchTerm={searchTerm}
            firstMatchTracker={firstMatchTrackerRef.current}
            onElementContextMenu={handleContextMenu}
            selectedSelector={selectedSelector}
          />
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          role="menu"
          className="fixed bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-[70]"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleMapElement}
            className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-white text-sm first:rounded-t-lg"
          >
            Map This Element
          </button>
          <button
            onClick={handleCopySelector}
            className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-white text-sm border-t border-gray-600"
          >
            Copy Selector
          </button>
          <button
            onClick={handleInspect}
            className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-white text-sm border-t border-gray-600 last:rounded-b-lg"
          >
            Inspect
          </button>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
        onClick={onClose}
      >
        <div
          className="max-w-6xl max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </div>
    );
  }

  return content;
}
