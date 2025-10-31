# Visual DOM Inspector - Execution Prompts

**Purpose**: This document contains a sequence of clear, unambiguous prompts designed to be executed sequentially to implement the Visual DOM Inspector feature. Each prompt is self-contained but depends on previous prompts. Prompts are written to minimize ambiguity and maximize probability of successful implementation.

---

## PHASE 1: Visual HTML Viewer with Element Inspection

### PROMPT 1.1: Create DataReceivedInspector Modal Component Structure

**Objective**: Create the foundational modal component that will house the entire inspector interface.

**Scope**: 
- Create a new file: `src/components/DataReceivedInspector.tsx`
- This component should be a modal that receives a `dataReceivedId` prop
- The modal should display a header with the data_received record's URL
- The modal should contain two main sections (panes) that will be implemented in subsequent prompts
- Export the component for use in DataReceivedDetails

**Key Requirements**:
- Modal should be dismissible (close button in header)
- Use Tailwind CSS for styling, match existing project design patterns
- Reserve 60% width for left pane (visual HTML), 40% width for right pane (DOM tree)
- Add a horizontal divider between panes that is visually clear
- Modal should be responsive but prioritize desktop experience
- State management: use React hooks (useState) for selected node tracking
- Do NOT implement the individual panes yet; just create the container and placeholder divs

**Acceptance Criteria**:
- Component renders without errors
- Modal displays the data_received URL in header
- Two panes are visible with correct width proportions (60/40)
- Can be imported and used in DataReceivedDetails.tsx
- Close button dismisses the modal

---

### PROMPT 1.2: Create VisualHTMLPane Component

**Objective**: Build the left pane that renders the HTML content in an isolated context.

**Scope**:
- Create a new file: `src/components/VisualHTMLPane.tsx`
- This component receives:
  - `html: string` (the HTML content to render)
  - `selectedNodeId?: string` (ID or reference to currently selected DOM node)
  - `onElementClick: (element: HTMLElement) => void` (callback when user clicks an element)
- Render the HTML in a shadow DOM or iframe to isolate styles (similar to existing HtmlViewer component)
- Add a transparent overlay that captures click events and tracks which visual element was clicked
- When user clicks a visual element, call `onElementClick` with that element reference

**Key Requirements**:
- Reuse or extend the existing HtmlViewer component logic (check if HtmlViewer already has element tracking)
- Overlay should NOT prevent user interaction with the rendered content (pointer-events: none except on hover)
- Clicked elements should get a visual highlight (border or background, should be clear but not obtrusive)
- Handle large HTML gracefully (150KB+ should not freeze UI)
- Clear selected element when clicking outside all elements
- Pass the HTML element reference (not just tag name) to the callback so Phase 1.3 can map it to the DOM tree

**Acceptance Criteria**:
- HTML renders correctly in isolated context (no external style conflicts)
- Clicking any visual element produces a callback with the element reference
- Clicked element is visually highlighted (border/outline)
- Highlight clears when clicking background or closing inspector
- No performance issues with large HTML files

---

### PROMPT 1.3: Create DOMTreePane Component - Basic Tree Display

**Objective**: Build the right pane that shows a hierarchical tree view of the DOM structure.

**Scope**:
- Create a new file: `src/components/DOMTreePane.tsx`
- This component receives:
  - `htmlString: string` (the HTML content to parse into a DOM tree)
  - `selectedElement?: HTMLElement` (the currently selected visual element from the VisualHTMLPane)
  - `onNodeSelect: (node: any, nodePath: string) => void` (callback when user clicks a DOM node)
- Parse the HTML string into a tree structure (reuse HtmlNode interface from htmlParser.ts)
- Recursively render the tree as an expandable/collapsible hierarchy
- Each tree node should display:
  - Element tag (or "text" for text nodes, "comment" for comments)
  - Key attributes (id, class) if present
  - Text content preview (first 50 chars for text nodes, truncated with ellipsis)
  - Expand/collapse chevron if node has children

**Key Requirements**:
- Tree nodes are clickable; clicking a node calls `onNodeSelect`
- When a visual element is selected in VisualHTMLPane, automatically find and highlight the corresponding node in the tree, then scroll tree to make it visible
- Tree should expand ancestors of the selected node to keep it visible without user manual expansion
- Each tree node needs a unique identifier (use array index path or generate unique ID)
- Use parseHtml() from htmlParser.ts to convert HTML string to HtmlNode tree
- Visual highlighting of selected node: clear background color (suggest: light blue or gray)
- Indentation: use 20px per nesting level to show hierarchy clearly
- Do NOT implement search/filter in this prompt (that's Phase 2)

**Acceptance Criteria**:
- DOM tree renders with correct hierarchy and indentation
- Tree nodes are clickable and selectable
- Selecting a visual element in left pane automatically selects and highlights corresponding tree node in right pane
- Tree auto-scrolls to keep selected node visible
- Tree expands ancestors as needed to show selected node
- Text node previews are truncated at 50 chars

---

### PROMPT 1.4: Implement Bidirectional Selection Linking

**Objective**: Wire up the two panes so selecting an element in one pane immediately highlights the corresponding node in the other.

**Scope**:
- Modify DataReceivedInspector.tsx to manage shared selection state
- Implement the logic to:
  - When user clicks a visual element in VisualHTMLPane, find the corresponding DOM tree node and select it
  - When user clicks a DOM tree node in DOMTreePane, find the corresponding visual element and highlight it
- Create a helper function to map between HTML elements and HtmlNode tree nodes (by comparing element structure)
- Update VisualHTMLPane to accept a `highlightedElement` prop and highlight it visually
- Update DOMTreePane to receive the visual element and find its match in the tree

**Key Requirements**:
- Selection state lives in DataReceivedInspector parent component
- Both panes are kept in sync at all times
- Visual highlight in left pane (border or background color) should be distinct from DOM tree highlight in right pane
- Mapping logic must handle:
  - Matching element by tag name and position in parent
  - Text nodes (content comparison)
  - Elements with multiple attributes
- Performance: mapping should complete in < 50ms even for large trees (150KB+)
- Edge case: if visual element can't be found in DOM tree (shouldn't happen), show error state or ignore silently

**Acceptance Criteria**:
- Click visual element → DOM tree node is selected and tree scrolls to show it
- Click DOM tree node → visual element is highlighted in the rendered HTML
- Both highlights are clearly visible
- Syncing works reliably across multiple selections
- No lag or performance issues with large documents

---

### PROMPT 1.5: Style the Inspector with Visual Polish

**Objective**: Add visual polish and usability refinements to the Phase 1 foundation.

**Scope**:
- Refine all styling in DataReceivedInspector, VisualHTMLPane, DOMTreePane
- Add visual indicators for clarity:
  - Selected node in tree: light blue background + border on left side (3px blue line)
  - Hovering over tree node: slight gray background (hover state)
  - Selected element in visual pane: border or outline (suggest: 2px blue border)
  - Hovering over visual element: slight background highlight or border
- Add spacing/padding:
  - Tree nodes: 4px vertical padding, 8px horizontal padding
  - Text in tree nodes: use monospace font for tag names, code-style appearance
  - Pane divider: 2px gray line, slightly darker than background
- Modal styling:
  - Modal header with URL text and close button
  - Appropriate z-index to appear above other UI
  - Max height/width to fit on typical screens (suggest: 90vw width, 90vh height)
- Use Tailwind CSS classes, avoid inline styles where possible

**Key Requirements**:
- All colors should use project's color palette (check tailwind.config.js for theme colors)
- Contrast ratios should meet WCAG AA standards for accessibility
- Keyboard focus states should be visible (for Phase 2 keyboard navigation)
- Scrollbars should be visible and usable in both panes
- No layout shifts when expanding/collapsing tree nodes

**Acceptance Criteria**:
- Inspector looks polished and professional
- Selection states are immediately obvious
- All text is readable
- Panes are clearly separated
- Modal fits on typical screen sizes without overflow

---

### PROMPT 1.6: Test Phase 1 with Real Data Records

**Objective**: Verify Phase 1 works correctly with real data_received records from the database.

**Scope**:
- Manually test the inspector with multiple real data_received records
- Test records should include:
  - The problematic KPMG record (c3443de1-bfd3-4c2b-a0f5-9229ac984f4e)
  - A few other records to verify it works across different job posting formats
- Create a quick test/debug page at `/app/test-inspector` that lists all data_received records with "Open Inspector" buttons
- Use the inspector to manually click various elements and verify bidirectional selection works

**Key Requirements**:
- Integration into DataReceivedDetails: add "Open Inspector" button that launches the modal
- Inspector should load and display HTML without crashes
- Bidirectional selection should work reliably
- No console errors or warnings
- Performance should be acceptable (< 2 second load time for any record)

**Acceptance Criteria**:
- Inspector opens without errors
- Can select and highlight elements in KPMG record
- Can navigate DOM tree and see visual highlighting
- Works with at least 3 different data_received records
- No performance issues or hangs

---

## PHASE 2: DOM Tree Navigation & Content Preview

### PROMPT 2.1: Enhance DOM Tree Node Display with Attributes and Content Preview

**Objective**: Improve the visual information density of tree nodes to help users understand what they're looking at.

**Scope**:
- Modify DOMTreePane to display:
  - Element tag (already done)
  - Key attributes in a readable format: show `id`, `class`, and any `data-*` attributes inline
  - Attribute display format: `<div#myId.className data-value="123">` or similar compact notation
  - Text node preview: show first 50 characters of text content with `[text]` label
  - Comment nodes: show `<!--` comment preview `-->` with 50 char limit
- Each tree node row should be scannable at a glance and tell the user "what this element is"

**Key Requirements**:
- Use compact notation to avoid horizontal scrolling
- Truncate class names and data attributes if too long
- Use different text colors/styles for different node types (tag vs text vs comment)
- Monospace font for tag names and attribute values
- Hover tooltip showing full content/attributes (if truncated)

**Acceptance Criteria**:
- Tree nodes clearly show tag, id, class, and other key attributes
- Text nodes clearly labeled as text with content preview
- No excessive horizontal scrolling
- Tree remains readable and scannable
- Truncated content is clearly indicated (with "..." or ellipsis)

---

### PROMPT 2.2: Add Search/Filter Functionality to DOM Tree

**Objective**: Allow users to filter the DOM tree by tag name, text content, or attributes.

**Scope**:
- Add a search input field at the top of DOMTreePane (above the tree)
- Implement three filter modes:
  1. **By tag name**: user types "ul" and only `<ul>` and `<ol>` nodes are shown (configurable)
  2. **By text content**: user types "responsibilities" and only nodes with that text are shown
  3. **By attributes**: user types "class:requirements" and only nodes with that class are shown
- Display filter results in real-time as user types
- Show a match counter: "15 matches" or similar
- Clear button to reset filter
- Filter should NOT collapse the tree, but should hide non-matching nodes and their descendants
- Debounce filter input (250ms) to avoid excessive re-renders

**Key Requirements**:
- Search input is debounced to prevent lag
- Filter is case-insensitive
- Matching nodes stay expanded so user can see context
- Match counter updates as user types
- Clear button resets filter and restores full tree view
- Filter works on large trees without performance issues

**Acceptance Criteria**:
- Can filter by tag name (e.g., "ul", "h3") and see only those nodes
- Can filter by text content (e.g., "benefits") and see matching text nodes and their parents
- Can filter by attribute (e.g., "class:requirements")
- Filter is responsive (< 100ms for large trees)
- Clear button works correctly

---

### PROMPT 2.3: Add Breadcrumb Navigation

**Objective**: Show the path from root to selected node, allowing users to understand and navigate context.

**Scope**:
- Add a breadcrumb bar above or below the tree display
- Breadcrumb shows the path from root to selected node: `root > div > ul > li`
- Each breadcrumb segment is clickable and jumps to that node in the tree
- Breadcrumb updates dynamically as user selects different nodes
- If no node is selected, breadcrumb shows "No node selected" or is hidden

**Key Requirements**:
- Breadcrumb is visually distinct from the tree
- Breadcrumb text is truncated with ellipsis if tag/attribute text is too long
- Clicking breadcrumb segment scrolls tree and selects that node
- Breadcrumb reflects the selected node at all times

**Acceptance Criteria**:
- Breadcrumb displays correct path to selected node
- Breadcrumb updates when selection changes
- Breadcrumb segments are clickable and jump correctly
- Breadcrumb is readable even for deeply nested nodes

---

### PROMPT 2.4: Add Context Menu to DOM Tree Nodes

**Objective**: Provide quick access to useful actions via right-click context menu.

**Scope**:
- Right-click on any DOM tree node to show context menu with options:
  1. **Scroll to element**: Scroll the visual HTML pane to show this element (bonus: flash it briefly for visibility)
  2. **Copy XPath**: Copy XPath to clipboard (useful for user reference or debugging)
  3. **Copy CSS Selector**: Copy CSS selector to clipboard
  4. **View full HTML**: Show modal with complete HTML of this element (not just tag + attributes)
- Context menu should be positioned near cursor
- Menu should close when user clicks away or selects an action
- Provide visual feedback when action is performed (e.g., "Copied to clipboard" toast)

**Key Requirements**:
- Context menu uses standard UX patterns (appears near cursor, disappears on click away)
- "Scroll to element" should highlight the element briefly in the visual pane (e.g., 1 second flash)
- Copy actions should work reliably
- Toast notifications for feedback
- Context menu doesn't interfere with tree selection

**Acceptance Criteria**:
- Right-click shows context menu with 4 options
- All options work correctly
- Toast notifications appear for copy actions
- Scroll to element finds and highlights the element

---

### PROMPT 2.5: Test Phase 2 Functionality

**Objective**: Verify Phase 2 enhancements work correctly and intuitively.

**Scope**:
- Test search/filter with real data:
  - Filter by "ul" and verify only list nodes are visible
  - Filter by "responsibilities" and verify matching text nodes are found
  - Filter by "class:item" and verify filtering works
- Test breadcrumb navigation:
  - Select a deep node and verify breadcrumb shows correct path
  - Click breadcrumb segment and verify it navigates correctly
- Test context menu:
  - Right-click nodes and verify menu appears
  - Copy XPath/CSS selector and verify correctness (paste into browser console)
  - View full HTML and verify it matches
- Test with KPMG record and other real data

**Key Requirements**:
- All Phase 2 features should work reliably
- Performance should remain acceptable
- No regressions to Phase 1 functionality

**Acceptance Criteria**:
- Search/filter works correctly and is performant
- Breadcrumb navigation is intuitive and accurate
- Context menu actions all work
- No bugs or console errors

---

## PHASE 3: Manual Tagging Interface (MVP)

### PROMPT 3.1: Create manual_tags Database Table and Service Layer

**Objective**: Set up persistent storage for user-created manual tags.

**Scope**:
- Create database migration/schema:
  - Table: `manual_tags`
  - Columns:
    - `id` (UUID, primary key)
    - `dataReceivedId` (UUID, foreign key to data_received)
    - `tagType` (TEXT: 'requirement', 'responsibility', 'benefit', 'nicetohave', 'other')
    - `domPath` (TEXT: node index path like "0.2.1.3" to identify element)
    - `textContent` (TEXT: the text content at time of tagging)
    - `userNotes` (TEXT, nullable: optional user comment)
    - `createdAt` (INTEGER: unix timestamp)
    - `updatedAt` (INTEGER: unix timestamp)
  - Create foreign key constraint on dataReceivedId
- Create service file: `src/services/manualTagsService.ts`
  - Function: `createManualTag(data)` → returns created tag
  - Function: `getTagsByDataReceivedId(dataReceivedId)` → returns array of tags
  - Function: `updateManualTag(tagId, data)` → returns updated tag
  - Function: `deleteManualTag(tagId)` → void
  - Function: `getTagByPath(dataReceivedId, domPath)` → returns tag or null (for conflict detection)

**Key Requirements**:
- Use better-sqlite3 consistent with existing database code
- Follow existing service patterns (see roleCompanyService.ts for reference)
- All functions should work within transaction context
- tagType values should be well-defined (use enum or constants)
- domPath must be a standardized format (recommend: "0.2.1.3" = child 0, grandchild 2, great-grandchild 1, great-great-grandchild 3)

**Acceptance Criteria**:
- Database table exists and can be queried
- All service functions work correctly
- Can create, read, update, delete tags
- Foreign key constraints are enforced

---

### PROMPT 3.2: Create TagForm Component for Assigning Tags

**Objective**: Build the UI for users to assign semantic tags to selected DOM regions.

**Scope**:
- Create a new file: `src/components/TagForm.tsx`
- Component receives:
  - `selectedNodePath: string` (the DOM path of selected node)
  - `selectedTextContent: string` (the text content of selected region)
  - `onSubmit: (tagData) => void` (callback when user saves tag)
  - `onCancel: () => void` (callback when user cancels)
  - `existingTag?: ManualTag` (if editing an existing tag)
- Form fields:
  1. **Tag Type dropdown**: options are 'requirement', 'responsibility', 'benefit', 'nicetohave', 'other'
  2. **Text Content preview**: read-only display of what was selected (first 100 chars, truncated with ellipsis)
  3. **User Notes**: optional textarea for user to add context about this tag
  4. **Buttons**: Save and Cancel
- Display as a modal dialog or side panel

**Key Requirements**:
- Tag Type is a required field (pre-select first option)
- Text Content preview is read-only and non-editable
- User Notes field is optional
- Form validation: Tag Type must be selected before save
- Show error if attempting to save with conflicting tag at same path (tell user to update/delete existing tag)
- On submit, call `onSubmit(tagData)` with: { tagType, userNotes, selectedNodePath, selectedTextContent }

**Acceptance Criteria**:
- Form renders correctly as modal or panel
- Dropdown shows all tag types
- Text preview displays correctly
- Can input notes
- Save validates form and calls callback
- Cancel closes form without saving

---

### PROMPT 3.3: Create TagList and TagManager Component

**Objective**: Display all tags created in the current session and allow editing/deletion.

**Scope**:
- Create a new file: `src/components/TagList.tsx`
- Component receives:
  - `tags: ManualTag[]` (array of tags to display)
  - `onSelectTag: (tag) => void` (highlight tag in visual/tree)
  - `onEditTag: (tag) => void` (open TagForm to edit)
  - `onDeleteTag: (tagId) => void` (delete tag after confirmation)
- Display tags in a list/table format with columns:
  - **Tag Type**: with color-coded background (each type gets a consistent color)
  - **Text Content**: first 50 chars of what was tagged
  - **User Notes**: if present, show first 50 chars
  - **Actions**: Edit and Delete buttons
- Clicking a tag should highlight it in both visual and tree panes (call `onSelectTag`)
- Show empty state message if no tags exist
- Display total tag count at top

**Key Requirements**:
- Each tag type has a consistent color throughout the inspector (e.g., Requirement = blue, Responsibility = green)
- Tag list is scrollable if there are many tags
- Clicking tag highlights it in the inspector (syncs selection)
- Edit/Delete buttons work reliably
- Delete should ask for user confirmation
- Tag count updates as tags are added/removed

**Acceptance Criteria**:
- Tags display in a clear, readable list
- Each tag shows type, content preview, and notes
- Can select, edit, delete tags
- Tag count is accurate
- Color coding is consistent

---

### PROMPT 3.4: Integrate Tagging into DataReceivedInspector

**Objective**: Wire up the tagging workflow into the inspector's main flow.

**Scope**:
- Modify DataReceivedInspector.tsx to:
  1. Load existing tags for the current dataReceivedId on mount
  2. Add a "Tag Selection" button or mode that allows user to start tagging process
  3. When user enters tagging mode:
     - Selected DOM node cannot change (frozen)
     - VisualHTMLPane shows visual indicator that node is locked for tagging
     - TagForm dialog appears with selected node's path and text
  4. On TagForm submit:
     - Call manualTagsService.createManualTag() to save to database
     - Add tag to local state
     - Show success toast notification
     - Highlight the newly created tag in the list and visual/tree panes
     - Exit tagging mode
  5. Add TagList component to inspector UI (side panel or bottom panel)
  6. When user clicks a tag in TagList:
     - Highlight that tag's DOM node and visual element
     - Show the node path and text content
     - Optionally show Edit/Delete buttons

**Key Requirements**:
- Tagging workflow is clear and intuitive
- Tags are immediately visible after creation
- Tags persist (load from database on inspector open)
- Highlighting tags in inspector should work like regular selection
- Visual feedback at every step (toast notifications for success/error)
- Load existing tags from database when inspector opens

**Acceptance Criteria**:
- Can create a new tag through the tagging workflow
- Tags are saved to database and persist
- Can view, edit, delete existing tags
- Tag highlighting works in both visual and tree panes
- Workflow is intuitive and error-free

---

### PROMPT 3.5: Implement Conflict Detection for Overlapping Tags

**Objective**: Prevent or warn user about overlapping tag assignments.

**Scope**:
- Add conflict detection logic:
  - Before saving a new tag, check if a tag already exists at the same DOM path
  - If conflict exists, show user a dialog with options:
    1. Cancel (don't save new tag)
    2. Update existing tag (replace the old tag with new one)
    3. Create anyway (allow overlapping tags at same path)
  - Provide context: show the existing tag's type, notes, and creation time
- Edge cases to handle:
  - Overlapping but not identical paths (e.g., parent and child node tagged differently) - should NOT be flagged as conflict
  - Same path, different tag types - should be flagged

**Key Requirements**:
- Conflict detection uses domPath field for comparison
- User gets clear context about existing tag before making decision
- Option to update existing tag or cancel
- Do NOT flag partial overlaps (parent/child) as conflicts in MVP

**Acceptance Criteria**:
- Detects exact path conflicts correctly
- Shows user dialog with conflict info
- User can update or cancel
- Does not flag parent/child tagging as conflicts

---

### PROMPT 3.6: Add Tag Export Functionality (for Testing/Review)

**Objective**: Allow user to export tags as JSON for review or integration testing.

**Scope**:
- Add an "Export Tags" button in the TagList or inspector header
- Clicking export should:
  1. Generate JSON with all tags for current dataReceivedId
  2. Format: array of objects with all tag fields (tagType, textContent, userNotes, domPath, createdAt)
  3. Download JSON file named: `tags_[dataReceivedId]_[timestamp].json`
  4. Or copy JSON to clipboard and show success toast
- JSON should be pretty-printed (indented) for readability

**Key Requirements**:
- Export button is easily accessible
- JSON is properly formatted and includes all fields
- File naming includes dataReceivedId and timestamp
- Copy-to-clipboard option provides feedback

**Acceptance Criteria**:
- Can export tags as JSON
- JSON is valid and readable
- File download or clipboard copy works

---

### PROMPT 3.7: Test Phase 3 End-to-End Tagging Workflow

**Objective**: Verify the complete tagging workflow works correctly with real data.

**Scope**:
- Manual testing with KPMG record:
  1. Open inspector on KPMG record
  2. Select the "Responsibilities:" header in the DOM tree
  3. Click "Tag Selection" button
  4. Open TagForm, assign tag type "Responsibility"
  5. Save tag
  6. Verify tag appears in TagList
  7. Create another tag for a responsibility item in the list
  8. Test editing an existing tag
  9. Test deleting a tag
  10. Export tags as JSON and verify format
- Test conflict detection:
  1. Try to tag the same node twice
  2. Verify conflict dialog appears
  3. Choose to update or cancel, verify behavior
- Test persistence:
  1. Close inspector and reopen
  2. Verify previously created tags are loaded from database

**Key Requirements**:
- All tagging operations work reliably
- Tags are persisted and load correctly
- Workflow is intuitive and error-free
- No console errors or crashes

**Acceptance Criteria**:
- Can create, edit, delete tags successfully
- Tags persist to database and reload
- Conflict detection works correctly
- Export produces valid JSON
- Workflow is smooth and error-free

---

## PHASE 4: Integration with Parsing Results (Optional, Later Phase)

**Note**: This phase is marked as optional and deferred. Implement only after Phase 1-3 are fully tested and working. The prompts below are provided for reference but should NOT be executed without explicit user request.

### PROMPT 4.1: Display Automatic Parsing Results in Inspector

**[Deferred until Phase 4 implementation is requested]**

### PROMPT 4.2: Create Side-by-Side Comparison View

**[Deferred until Phase 4 implementation is requested]**

### PROMPT 4.3: Implement Accept/Reject Workflow

**[Deferred until Phase 4 implementation is requested]**

---

## PHASE 5: Advanced Features (Future)

**Note**: These prompts are provided for future reference but should NOT be executed without explicit user request and planning.

**Potential Prompts**:
- Implement bulk tagging workflow
- Add template-based tagging (predefined patterns)
- Implement tagging history/undo
- Create training data export from manual tags
- Integrate manual tags as hints to parsing logic

---

## Execution Order & Dependencies

**Execute in this strict order**:

1. PHASE 1 (Foundation):
   - 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6

2. PHASE 2 (Navigation):
   - 2.1 → 2.2 → 2.3 → 2.4 → 2.5

3. PHASE 3 (Tagging MVP):
   - 3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6 → 3.7

4. PHASE 4 (Integration):
   - Only if user explicitly requests

5. PHASE 5 (Advanced):
   - Only if user explicitly requests

Each phase can only start after the previous phase passes acceptance criteria.

---

## Key Principles for Prompt Execution

1. **Completeness**: Each prompt is self-contained; all necessary context is provided
2. **Specificity**: Requirements are detailed enough to minimize ambiguity
3. **Testability**: Each prompt has clear acceptance criteria
4. **Sequentiality**: Dependencies between prompts are explicit
5. **User Safety**: No data mutations or breaking changes without explicit approval
6. **Ambiguity Minimization**: Requirements avoid vague terms like "make it look good" (see Phase 1.5 for exception, which has specific styling guidance)

---

## Notes for Claude Code Executor

- **Before starting any prompt**: Confirm you understand all requirements and haven't missed any details
- **After completing a prompt**: Ask user to review acceptance criteria before moving to next prompt
- **If requirements are unclear**: Ask clarifying questions rather than making assumptions
- **If an earlier prompt breaks**: Stop and ask user for direction rather than proceeding with dependent prompts
- **Do NOT push to GitHub** unless explicitly instructed in the prompt or by the user
- **Do NOT make changes beyond the scope** of the current prompt

---

## Color Scheme Reference (to be finalized)

Suggested tag type colors for consistent use throughout inspector:

- **Requirement**: Blue (#2563EB or Tailwind blue-600)
- **Responsibility**: Green (#16A34A or Tailwind green-600)
- **Benefit**: Purple (#9333EA or Tailwind purple-600)
- **Nice-to-Have**: Amber (#D97706 or Tailwind amber-600)
- **Other**: Gray (#6B7280 or Tailwind gray-600)

These colors should be used consistently in TagList, tag highlighting in visual/tree panes, and any other tag displays.
