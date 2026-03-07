# Pre-Context: Editor

**Feature ID**: F004-editor
**Tier**: Tier 1
**Generated**: 2026-03-07

---

## Source Reference

**Source Root**: `/Users/coolhero/Develop/cherry-studio`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/renderer/src/components/RichEditor/` | TipTap rich text editor (WYSIWYG) |
| `src/renderer/src/components/MarkdownEditor/` | Markdown editor component |
| `src/renderer/src/components/CodeEditor/` | CodeMirror code editor |
| `src/renderer/src/components/CodeBlockView/` | Code block rendering with Shiki |
| `src/renderer/src/components/Preview/` | Markdown preview component |
| `src/renderer/src/pages/home/Markdown/` | Message markdown rendering pipeline |
| `src/renderer/src/hooks/useMermaid.ts` | Mermaid diagram rendering hook |
| `src/renderer/src/hooks/useCodeHighlight.ts` | Syntax highlighting hook |
| `packages/extension-table-plus/` | Custom TipTap table extension with resize |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **TipTap editor initialization with 15+ extensions, markdown-to-editor content conversion, editor-to-markdown export, Shiki syntax highlighting in code blocks, image upload with compression, link editing popup, KaTeX math rendering (block and inline), custom table extension with column resize, block-level drag handle, mention/command suggestion (/ trigger), table of contents navigation, CodeMirror initialization with 100+ languages, dynamic language detection, incremental code updates via fast-diff for streaming, mermaid diagram rendering with debounced validation (300ms), markdown preview with remark/rehype pipeline, GitHub Flavored Markdown (GFM), GitHub blockquote alerts, and React Flow conversation visualization**
- Do not reference: Ant Design wrapper components (migrating to shadcn/ui), styled-components styling (migrating to Tailwind CSS 4)
- **Extract**: TipTap extension list and configuration, markdown serialization/deserialization logic, Shiki highlighter setup (theme, language registration), image upload pipeline (compression threshold, format handling), KaTeX rendering configuration (block vs inline detection), table resize logic (column width calculation), drag handle implementation, mention/suggestion popup behavior (/ trigger, filtered results), table of contents extraction from headings, CodeMirror extension setup (language detection, theme, keybindings), fast-diff based incremental update algorithm for streaming, mermaid rendering pipeline (parse -> validate -> render with 300ms debounce), remark/rehype plugin chain, GFM extension configuration, alert blockquote parsing, React Flow node/edge generation from conversation data
- **Ignore**: Ant Design component wrappers, styled-components CSS-in-JS patterns

### SBI Table (B111-B140)

| SBI ID | Behavior | Priority | Description |
|--------|----------|----------|-------------|
| B111 | RichEditor.init | P1 | Initialize TipTap with 15+ extensions |
| B112 | RichEditor.getMarkdown | P1 | Convert editor content to markdown |
| B113 | RichEditor.setContent | P1 | Set editor content from markdown |
| B114 | CodeBlockShiki.highlight | P1 | Syntax highlighting in code blocks via Shiki |
| B115 | EnhancedImage.upload | P2 | Image upload with compression |
| B116 | EnhancedLink.edit | P2 | Link editing popup |
| B117 | EnhancedMath.render | P2 | KaTeX math rendering (block/inline) |
| B118 | TableKit.resize | P2 | Resizable tables with column width control |
| B119 | DragHandle.move | P2 | Block-level drag and drop |
| B120 | Mention.suggest | P2 | Command suggestion (/ trigger) |
| B121 | TableOfContents.navigate | P2 | Hierarchical heading navigation |
| B122 | CodeMirror.init | P1 | Initialize CodeMirror editor |
| B123 | CodeMirror.setLanguage | P1 | Dynamic language detection (100+ languages) |
| B124 | CodeMirror.streamUpdate | P2 | Incremental updates via fast-diff for streaming |
| B125 | Mermaid.render | P2 | Render mermaid diagrams (debounced 300ms) |
| B126 | Mermaid.validate | P2 | Validate mermaid syntax before rendering |
| B127 | MarkdownPreview.render | P1 | Render markdown with remark/rehype pipeline |
| B128 | MarkdownPreview.highlightCode | P1 | Shiki syntax highlighting in preview |
| B129 | MarkdownPreview.renderMath | P2 | KaTeX/MathJax rendering in preview |
| B130 | MarkdownPreview.renderGFM | P1 | GitHub Flavored Markdown rendering |
| B131 | MarkdownPreview.renderAlerts | P2 | GitHub blockquote alerts (note, tip, warning, etc.) |
| B132 | ChatFlowHistory.visualize | P3 | React Flow conversation visualization |
| B133 | CodeBlock.copy | P2 | Copy code block content to clipboard |
| B134 | CodeBlock.wrap | P2 | Toggle line wrap in code blocks |
| B135 | CodeBlock.languageLabel | P2 | Display detected language label |
| B136 | MarkdownPreview.renderTables | P2 | Render GFM tables with styling |
| B137 | MarkdownPreview.renderLinks | P2 | Render links with external open handling |
| B138 | RichEditor.undo/redo | P2 | Undo/redo with history tracking |
| B139 | RichEditor.focus/blur | P3 | Focus management for editor |
| B140 | EmojiPicker.select | P3 | Emoji selection (1000+ emojis, 28 languages) |

### UI Component Features

| Component | Library | Feature | Category |
|-----------|---------|---------|----------|
| RichEditor | TipTap 3.2 | Full WYSIWYG with 15+ extensions | content-creation |
| RichEditor | TipTap 3.2 | Bold/Italic/Underline/Strike toolbar | text-formatting |
| RichEditor | TipTap 3.2 | Heading levels H1-H6 | text-formatting |
| RichEditor | TipTap 3.2 | Bullet/Ordered/Task lists | text-formatting |
| RichEditor | TipTap 3.2 | Block-level drag handle | interaction |
| RichEditor | TipTap 3.2 | Image upload with compression | media |
| RichEditor | TipTap 3.2 | Table editing with resize | content-creation |
| RichEditor | TipTap 3.2 | Math (KaTeX) block/inline | content-creation |
| RichEditor | TipTap 3.2 | Mention/command suggestion | interaction |
| RichEditor | TipTap 3.2 | Table of contents | navigation |
| CodeEditor | CodeMirror 6 | 100+ language support | code-editing |
| CodeEditor | CodeMirror 6 | Multiple themes | code-editing |
| CodeEditor | CodeMirror 6 | Line numbers, bracket matching | code-editing |
| DiagramView | Mermaid 11.10 | 10+ diagram types | visualization |
| FlowView | React Flow 12.4 | Conversation flow visualization | visualization |
| EmojiPicker | emoji-picker-element 1.22 | 1000+ emojis, 28 languages | selection |

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.
> These files cannot be regenerated -- they must be copied as-is and placed in the appropriate location in the new project.
> Source Path is **relative to Source Root** (same as file paths above). Resolve as `[Source Root]/[Source Path]` at runtime.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| `src/renderer/src/assets/fonts/` | Fonts | `src/renderer/src/assets/fonts/` | Country flag fonts, icon fonts, Ubuntu fonts |

> If resources need modification (e.g., resizing images, updating translation keys), note it in the Usage column.

### Environment Variables

> Environment variables required by this Feature at runtime. Variables marked as `secret` must NOT have their actual values recorded here -- only the variable name and purpose.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| (none specific to F004) | | | Editor feature has no environment variables | |

**Shared variables** (defined by other Features but also used here):

| Variable | Owner Feature | Usage in This Feature |
|----------|--------------|----------------------|
| (none) | | Editor operates entirely in the renderer process with no env var dependencies |

### Naming Remapping

| Original | Replacement | Location |
|----------|------------|----------|
| (none specific to F004) | | Editor components have no Cherry-specific naming |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F004-editor provides the rich text editing, code editing, and content rendering infrastructure used throughout Angdu Studio. It includes a TipTap 3.2 WYSIWYG editor with 15+ extensions (bold, italic, underline, strike, headings H1-H6, bullet/ordered/task lists, block-level drag handle, image upload with compression, table editing with column resize, KaTeX math block/inline, mention/command suggestion via / trigger, table of contents, undo/redo), a CodeMirror 6 code editor with 100+ language support and incremental streaming updates via fast-diff, Shiki-based syntax highlighting for code blocks, a markdown preview pipeline using remark/rehype with GitHub Flavored Markdown (GFM), KaTeX/MathJax math rendering, GitHub blockquote alerts, mermaid diagram rendering with 300ms debounced validation and 10+ diagram types, React Flow conversation flow visualization, and an emoji picker supporting 1000+ emojis in 28 languages. The custom `extension-table-plus` package extends TipTap's table with column resize capability.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Rich text editing | User composes content in TipTap editor with formatting toolbar (bold, italic, lists, headings, etc.) |
| P1 | Markdown rendering | AI response is rendered as markdown with syntax highlighting, math, tables, and links |
| P1 | Code block display | Code blocks in AI responses are syntax-highlighted via Shiki with language detection |
| P1 | Streaming code update | During AI streaming, code blocks update incrementally via fast-diff without flicker |
| P2 | Image upload | User uploads an image in the editor; image is compressed if >1MB and inserted |
| P2 | Math rendering | LaTeX math expressions render as formatted equations (block and inline) |
| P2 | Mermaid diagrams | Mermaid code blocks render as visual diagrams (flowchart, sequence, etc.) |
| P2 | Table editing | User creates/edits tables with resizable columns |
| P2 | Code editing | User edits code in CodeMirror with syntax highlighting and auto-detection |
| P2 | Command suggestion | User types / to trigger command suggestion popup |
| P3 | Flow visualization | Conversation history displayed as a React Flow diagram |
| P3 | Emoji selection | User picks emojis from picker with i18n support |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: TipTap rich text editor with 15+ extensions
- **FR-002**: Markdown rendering with GFM, math, syntax highlighting
- **FR-003**: CodeMirror code editor with 100+ languages
- **FR-004**: Mermaid diagram rendering
- **FR-005**: Image handling with compression
- **FR-006**: Streaming-compatible incremental code block updates

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: TipTap editor initializes with all 15+ extensions without errors
- **SC-002**: Markdown rendering correctly handles GFM tables, code blocks, math, and alerts
- **SC-003**: Code blocks syntax-highlight correctly for top 20 languages
- **SC-004**: Mermaid diagrams render within 500ms of content change (300ms debounce + render)
- **SC-005**: Streaming code block updates apply without visible flicker
- **SC-006**: Image upload compresses files >1MB and inserts correctly
- **SC-007**: KaTeX math renders correctly for both block and inline expressions

### Edge Cases

- Invalid mermaid syntax; must show error message instead of broken diagram
- Very large code blocks (10000+ lines); must not freeze UI during highlighting
- Streaming update with conflicting diff; fast-diff must resolve without corruption
- Math expression with unbalanced delimiters; graceful fallback to raw text
- Image upload exceeding maximum size; proper error message
- Language detection ambiguity in code blocks; fallback to plain text
- TipTap editor with very long content; must maintain responsive editing
- Emoji picker with missing locale data; fallback to English
- React Flow with 1000+ nodes; must not freeze UI
- Table with many columns; horizontal scroll instead of overflow

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-app-core | Infrastructure | Uses IPC framework for clipboard operations, theme system for editor theming |

### Related Entities (data-model.md draft)

#### Owned Entities

None -- F004 does not own persistent entities. It provides rendering components used by other features.

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| MessageBlock | F003-chat | Read | Renders message block content (text, code, image, etc.) |
| Topic | F003-chat | Read | Used by ChatFlowHistory for conversation visualization |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| Component | `RichEditor` | TipTap WYSIWYG editor component |
| Component | `CodeEditor` | CodeMirror code editor component |
| Component | `CodeBlockView` | Syntax-highlighted code block renderer |
| Component | `MarkdownPreview` | Markdown preview/rendering component |
| Component | `MermaidView` | Mermaid diagram renderer |
| Component | `ChatFlowHistory` | React Flow conversation visualizer |
| Component | `EmojiPicker` | Emoji selection component |
| Hook | `useMermaid()` | Mermaid rendering hook |
| Hook | `useCodeHighlight()` | Code highlighting hook |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| IPC | `system:clipboard` | F001-app-core | Copy code block content to clipboard |
| CSS | Theme variables | F001-app-core | Editor theming (light/dark mode) |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Editor components use TipTap 3.2 with 15+ extensions including a custom table-plus extension for column resize. CodeMirror 6 provides code editing with 100+ languages. Shiki handles syntax highlighting. Mermaid 11.10 renders diagrams. Markdown rendering uses a remark/rehype pipeline with GFM, math, and alert plugins. React Flow 12.4 visualizes conversation history. Emoji picker uses emoji-picker-element. Streaming code updates use fast-diff for incremental patching. UI wrappers use Ant Design and styled-components.
- **Recommended implementation approach**: Keep TipTap, CodeMirror, Shiki, Mermaid, remark/rehype, React Flow, and emoji-picker-element as-is since they are library-specific and stack-independent. Replace Ant Design wrapper components with shadcn/ui equivalents (buttons, dropdowns, tooltips in toolbars). Replace styled-components with Tailwind CSS 4 for editor chrome and layout. The core rendering logic (markdown pipeline, syntax highlighting, mermaid rendering, fast-diff streaming) is entirely reusable.
- **Caveats**: TipTap editor toolbar must be rebuilt with shadcn/ui components instead of Ant Design. Theme integration must map Tailwind CSS 4 dark mode classes to TipTap and CodeMirror theme configurations. The custom `extension-table-plus` package is TipTap-native and requires no changes. Mermaid theme must sync with app theme (light/dark).

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Message block rendering | F003-chat | Verify F004's markdown/code rendering correctly handles all 9 block types from F003 |
| Streaming code updates | F003-chat | Verify F004's fast-diff incremental updates work correctly with F003's streaming pipeline |
| Theme integration | F001-app-core | Verify F004's editor themes (TipTap, CodeMirror, Mermaid) sync with F001's theme system |
| Clipboard access | F001-app-core | Verify F004's code block copy uses F001's clipboard IPC channel |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F003-chat | Rendering impact | If markdown rendering pipeline or code block component changes, F003's message display is affected |
| F003-chat | Streaming impact | If fast-diff incremental update logic changes, F003's streaming code block display is affected |
| F003-chat | Block type impact | If supported block rendering types change, F003 must update its block type system |
