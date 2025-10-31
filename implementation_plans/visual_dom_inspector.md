# Visual DOM Inspector for Data Received Records

## Overview
Provide users with a Chrome DevTools-like interface to visually inspect and manually tag HTML content from data_received records. Users can see the rendered HTML side-by-side with the DOM tree, click on visual elements to highlight their corresponding DOM nodes, and manually assign semantic tags to sections when automatic parsing fails.

## Core Philosophy
- **Maximum Usability**: Prioritize intuitive visual interaction over feature completeness
- **Minimal Cognitive Load**: Clear visual feedback at every interaction level
- **Non-Destructive**: Manual tagging supplements (not replaces) automatic parsing
- **Compartmentalized**: Each phase builds independently; later phases can be added without refactoring earlier work

---

## Phase 1: Visual HTML Viewer with Element Inspection

**Goal**: Display the HTML content in a visual inspector view, allow users to click elements and see their corresponding DOM node information.

**Deliverables**:
1. New page/modal: `/app/inspector` or modal component within DataReceivedDetails
2. Split-pane layout:
   - **Left pane**: Rendered HTML (in iframe or shadow DOM)
   - **Right pane**: DOM tree view (hierarchical, expandable/collapsible)
3. Element selection mechanism:
   - User clicks on visual element in left pane
   - Corresponding DOM node highlights in right pane
   - Show node details: tag name, attributes, text content (truncated)
4. Bidirectional selection:
   - Clicking visual element highlights in DOM tree
   - Clicking DOM tree node highlights in visual render
5. Visual highlight styling:
   - Selected element gets clear visual border/background
   - Selected node in tree gets background color
   - Hover previews for both sides

**Why This Phase First**:
- Foundation for all later phases
- Solves the core usability problem: "What DOM element does this visual part correspond to?"
- Can be tested and validated before adding tagging functionality
- Reusable component for future debugging features

**Implementation Considerations**:
- Use HtmlViewer component as base (already renders HTML in isolated context)
- Build DOM tree component (recursive, handles deep nesting)
- Track element selection state (selected node object, position in tree)
- Handle large DOM trees efficiently (virtualization if needed)
- Preserve node identity when scrolling/filtering

---

## Phase 2: DOM Tree Navigation & Content Preview

**Goal**: Make the DOM tree exploration user-friendly; help users understand what they're looking at.

**Deliverables**:
1. Improved DOM tree display:
   - Show element type (text node, comment, element with tag)
   - Show text content preview (first 50 chars for text nodes)
   - Show key attributes (class, id, data-* attributes)
   - Collapse/expand chevrons for parent nodes
   - Visual hierarchy indentation
2. Search/filter DOM tree:
   - Filter by tag name (e.g., "show only ul/ol")
   - Filter by text content (keyword search in text nodes)
   - Filter by attributes (e.g., "has class 'requirements'")
   - Real-time filtering with match count
3. Context menu on DOM nodes:
   - "Scroll to element" (in visual pane)
   - "Copy XPath" (for debugging)
   - "View full HTML" (show complete element HTML)
4. Breadcrumb navigation:
   - Show path from root to selected node
   - Click breadcrumb to jump to ancestor
   - Helps user understand nesting context

**Why This Phase**:
- Reduces user frustration when exploring large DOM trees
- Search/filter is essential for finding relevant sections in 150KB+ HTML
- Context menu operations are quick wins (copy XPath useful for debugging)
- Prepares mental model for Phase 3 tagging

**Dependencies**: Phase 1

---

## Phase 3: Manual Tagging Interface (MVP)

**Goal**: Allow users to select DOM regions and assign semantic tags to them.

**Deliverables**:
1. Tag assignment workflow:
   - User selects a DOM node or range of nodes (start node → end node)
   - Opens "Tag Selection" dialog/panel
   - User chooses tag type from dropdown (initially: Requirement, Responsibility, Benefit, Nice-to-Have, Other)
   - Optional: User adds note/comment about this tag
   - Save tag assignment
2. Visual feedback for tagged regions:
   - Tagged DOM nodes get background color (color-coded by tag type)
   - Visual pane shows overlay highlighting tagged regions
   - Tag label appears in/near highlighted region
3. Tag management panel:
   - List all tags created in this session
   - Show tag type, selected text content (preview), assigned time
   - Edit/delete buttons for each tag
   - Export tags as JSON (for testing/review)
4. Conflict detection:
   - Warn if tagging overlaps existing tags
   - Allow override with user confirmation
5. Storage:
   - Save tags to a new `manual_tags` table in database
   - Link to data_received record
   - Store: dataReceivedId, tagType, domPath (XPath or similar), textContent, userNotes, createdAt

**Why This Phase**:
- Solves the original problem: user can now manually correct parsing failures
- MVP approach: tag assignment without complex workflows
- Database persistence enables future use of manual tags (training data, override logic)
- XPath/domPath enables mapping tags back to content even if HTML structure changes slightly

**Dependencies**: Phase 1, Phase 2

---

## Phase 4: Integration with Parsing Results (Optional, Later Phase)

**Goal**: Show automatic parsing results alongside manual tags; enable user review/correction workflow.

**Deliverables**:
1. Display parsed sections from parseVisualSections:
   - Show identified sections with their type (requirements, responsibilities, etc.)
   - Highlight section boundaries in DOM tree
   - Show confidence scores
2. Side-by-side comparison:
   - Automatic parsing results in one column
   - Manual tags in another column
   - Visual differences highlighted
3. "Accept/Reject" workflow:
   - User reviews automatic parsing
   - Can accept, modify, or reject each section
   - Can add manual tags where parsing failed
4. Conflict resolution:
   - If automatic parsing and manual tags overlap, ask user to choose
   - Or allow user to merge/reconcile them

**Why This Phase (Later)**:
- Depends on understanding tagging workflow first (Phase 3)
- More complex UX (reconciling two data sources)
- Can be added iteratively without breaking earlier phases
- May reveal insights about parsing failures for future ML work

**Dependencies**: Phase 1, Phase 2, Phase 3

---

## Phase 5: Advanced Features (Future)

**Potential additions** (do NOT implement initially):
- Bulk tagging (select multiple regions at once)
- Template-based tagging (predefined section patterns)
- Tagging history/undo (track changes to tags)
- Export manual tags to training data format
- Integration with listingDescriptionExtractor (use manual tags as hints)
- Multi-user review workflow (different users can tag same record)

---

## UI/UX Design Principles

1. **Clarity through Color**:
   - Each tag type has consistent color (Requirement = blue, Responsibility = green, etc.)
   - Selection highlight = neutral (gray/white with border)
   - Hover states clearly indicate interactivity

2. **Visual Feedback**:
   - Every click produces immediate visual response
   - Loading states for async operations
   - Toast/notification for save success/error

3. **Scrolling Sync**:
   - When user scrolls in visual pane, DOM tree scrolls to show selected element
   - When user navigates DOM tree, visual pane scrolls to show element
   - Prevents user disorientation

4. **Progressive Disclosure**:
   - Show only essential controls initially
   - Advanced options (XPath, filters) available but not intrusive
   - Context menu for less-common actions

5. **Accessibility**:
   - Keyboard navigation through DOM tree (arrow keys, enter to select)
   - Screen reader friendly labels
   - High contrast for highlights

---

## Technical Architecture

### Components Structure
```
DataReceivedInspector (new page/modal)
├── VisualHTMLPane (left)
│   ├── HTMLRenderer (shadow DOM or iframe)
│   └── OverlayHighlights (tags, selections)
├── DOMTreePane (right)
│   ├── TreeNode (recursive)
│   ├── SearchFilter
│   ├── Breadcrumb
│   └── ContextMenu
└── TaggingPanel (bottom/side)
    ├── TagForm (dialog)
    ├── TagList
    └── TagManager
```

### Data Model

**manual_tags table**:
```sql
CREATE TABLE manual_tags (
  id UUID PRIMARY KEY,
  dataReceivedId UUID NOT NULL,
  tagType TEXT NOT NULL, -- 'requirement', 'responsibility', 'benefit', 'nicetohave', 'other'
  domPath TEXT, -- XPath or CSS selector to locate element
  textContent TEXT, -- captured text at time of tagging
  userNotes TEXT, -- optional user comment
  createdAt INTEGER,
  updatedAt INTEGER,
  FOREIGN KEY (dataReceivedId) REFERENCES data_received(id)
)
```

### State Management
- Use React Context or Zustand for:
  - Selected node (DOM element reference)
  - Current tags list
  - Active filters
  - UI state (pane sizes, expanded tree nodes)
- Persist tag list to database on save

### Performance Considerations
- Large HTML trees (150KB+): use virtualization in DOM tree view
- Highlight overlay: use CSS classes, not inline styles (avoids layout thrashing)
- Search: debounce filter input (250ms)
- Lazy load DOM tree: only render visible nodes initially

---

## Implementation Order (Recommended)

1. **Week 1: Phase 1 - Visual Inspector Foundation**
   - Create new inspector page/modal
   - Build split-pane layout
   - Implement element selection (visual → tree and vice versa)
   - Style highlights
   - Test with real data_received records

2. **Week 2: Phase 2 - DOM Navigation**
   - Improve tree display (attributes, text previews)
   - Add search/filter
   - Add breadcrumb
   - Test filter performance on large trees

3. **Week 3: Phase 3 - Manual Tagging**
   - Implement tag assignment workflow
   - Create manual_tags table
   - Build tag management UI
   - Save/load tags from database
   - Test end-to-end tagging workflow

4. **Future: Phase 4 & 5 as time/priority permits**

---

## Success Criteria

**Phase 1**:
- User can click any visual element and see its DOM node
- User can click any DOM node and see it highlighted visually
- Selection state persists during scrolling
- No performance degradation with large trees

**Phase 2**:
- User can search DOM tree by tag name in < 100ms
- User can filter by text content with intuitive results
- Breadcrumb accurately shows path to selected node
- Context menu actions work reliably

**Phase 3**:
- User can assign a tag to a DOM region in < 20 seconds
- Tagged regions are visually highlighted with consistent colors
- Tags persist to database and reload on next visit
- Export JSON is valid and shows all tag metadata

**Overall**:
- User can manually correct a misparsed data_received record in < 2 minutes
- Process requires no external tools (browser DevTools no longer needed)
- Manual tags provide ground truth for future improvements

---

## Open Questions / Decision Points

1. **Selection Granularity**: Can user tag:
   - Single element only?
   - Range (element A to element B)?
   - Multiple non-contiguous regions?
   - **Recommendation**: Start with single element, add range in Phase 4

2. **Tag Storage**: Store tags:
   - In database? (enables persistence, querying, integration)
   - In-session only? (faster iteration, no persistence)
   - **Recommendation**: Database from start (enables future ML training use)

3. **DOM Path Representation**: Use:
   - XPath? (standard but can be fragile if HTML structure changes)
   - CSS selectors? (less standard, similar fragility)
   - Node index path? (e.g., [0][2][1] = child 0, grandchild 2, great-grandchild 1, more robust)
   - **Recommendation**: Node index path (most robust, easier to debug)

4. **Inspector Location**: Implement as:
   - Separate page (/app/inspector)?
   - Modal dialog within DataReceivedDetails?
   - Expandable panel in DataReceivedDetails?
   - **Recommendation**: Modal within DataReceivedDetails (less UI clutter, easier navigation)

5. **Concurrent Editing**: Multiple users can:
   - Tag the same record simultaneously?
   - See each other's tags in real-time?
   - **Recommendation**: Not in MVP (Phase 5 enhancement)
