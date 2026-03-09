# Research: Chat UI

**Feature**: F005 - Chat UI | **Date**: 2026-03-09

## R1: TipTap Rich Editor Integration

**Decision**: Use TipTap 3 with custom extensions for slash commands, mentions, and auto-resize.

**Rationale**: TipTap is retained from the source project. It provides a ProseMirror-based editor with excellent extension system, React integration, and collaborative editing support. The source project already has working TipTap extensions for slash commands (`/`) and model mentions (`@`).

**Alternatives considered**:
- CodeMirror: Better for code, worse for rich text composition
- Plain textarea: Insufficient for slash commands, mentions, and rich formatting
- Lexical: Similar capability but would require full rewrite of existing extensions

## R2: Markdown Rendering Pipeline

**Decision**: Use react-markdown with remark-gfm, remark-math, rehype-katex/rehype-mathjax (configurable), rehype-raw, and custom plugins (rehypeHeadingIds, rehypeScalableSvg, remarkDisableConstructs). Code blocks via Shiki. Diagrams via Mermaid.

**Rationale**: This is the proven pipeline from the source project. react-markdown provides the base AST, remark plugins handle GFM/math syntax, rehype plugins handle rendering (KaTeX for math, raw HTML pass-through). Shiki provides accurate syntax highlighting with theme-aware coloring for 200+ languages. Mermaid renders diagrams client-side.

**Alternatives considered**:
- markdown-it: Less React-native, would require custom wrapper
- unified-only: react-markdown already uses unified internally, no benefit
- highlight.js instead of Shiki: Shiki provides more accurate token-based highlighting with VS Code grammar support

## R3: Smooth Streaming Animation

**Decision**: Implement useSmoothStream hook that buffers incoming text deltas and renders character-by-character at a configurable rate (default ~30 chars/frame).

**Rationale**: Raw streaming creates jittery rendering because tokens arrive in variable-size chunks. The smooth stream hook normalizes this by maintaining a buffer and draining it at a constant rate using requestAnimationFrame. This is a proven pattern from the source project.

**Key implementation detail**: The hook must integrate with React's batched state updates (React 19 automatic batching) to avoid triggering excessive re-renders. Use a ref for the buffer and only call setState on animation frames.

## R4: Input Tool Registry Architecture

**Decision**: Registry pattern with `defineTool()` factory and `registerTool()` registration. Tools declare key, label, scopes, condition, dependencies, and render function. Tool ordering persisted in useInputToolsStore with DnD reorder.

**Rationale**: The plugin pattern from the source project is well-abstracted. Each tool is a self-contained module that declares its requirements and renders its UI. The registry allows dynamic tool loading and scope-based filtering (Chat vs Session vs MiniWindow).

**Key types**:
```typescript
interface ToolDefinition {
  key: string
  label: string | ((t: TFunction) => string)
  visibleInScopes: InputbarScope[]
  condition?: (context: ToolRenderContext) => boolean
  dependencies?: { state: string[]; actions: string[] }
  render: (context: ToolRenderContext) => React.ReactNode | null
  quickPanel?: QuickPanelConfig
}
```

## R5: Imperative Modal/Toast Replacement

**Decision**: Replace `window.modal.confirm()` with a custom `useConfirmDialog()` hook backed by shadcn AlertDialog. Replace `window.toast.*()` with Sonner's `toast()` function.

**Rationale**: Ant Design's imperative APIs (window.modal, window.message) are global singletons attached to window. shadcn/ui uses declarative Radix-based components. Sonner provides a compatible imperative `toast()` API that can replace `window.toast` directly. For modals, a hook-based approach wraps AlertDialog with promise-based confirmation.

**Pattern**:
```typescript
// Confirm dialog hook
const { confirm } = useConfirmDialog()
const ok = await confirm({ title: '...', description: '...' })

// Toast (Sonner)
import { toast } from 'sonner'
toast.success('Message copied')
toast.error('Failed to send')
```

## R6: Event System Architecture

**Decision**: Retain the EventEmitter-based EventService for cross-component communication. Events are typed via a ChatEvent enum.

**Rationale**: The event system decouples components that need to communicate across the component tree without prop drilling or store coupling. Examples: SEND_MESSAGE from Inputbar triggers scrollToBottom in Messages; LOCATE_MESSAGE from Navigation triggers scroll+highlight in Message. Replacing with Zustand subscriptions would create tighter coupling between unrelated components.

**Events to implement**: SEND_MESSAGE, CLEAR_MESSAGES, NEW_CONTEXT, NEW_BRANCH, EDIT_CODE_BLOCK, EDIT_MESSAGE, LOCATE_MESSAGE, SHOW_TOPIC_SIDEBAR, ESTIMATED_TOKEN_COUNT, ADD_NEW_TOPIC

## R7: Zustand Store Design for UI State

**Decision**: Create 3 new Zustand stores for UI-specific state:
- `useRuntimeStore`: activeTopicOrSession, activeAgentId, isMultiSelectMode, generating state
- `useSettingsStore`: narrowMode, messageStyle, fontSize, sendMessageShortcut, mathEngine, showPrompt, topicPosition, etc.
- `useInputToolsStore`: visible/hidden tool ordering per scope, isCollapsed

**Rationale**: These slices are purely UI-focused state that doesn't belong in F003's data stores. useSettingsStore persists via Zustand persist middleware → electron-store via IPC. useRuntimeStore is transient (not persisted). useInputToolsStore persists tool ordering only.

**Alternatives considered**:
- Merging into existing F003 stores: Would bloat data stores with UI concerns
- React context: Insufficient for complex state with persistence needs
- Single monolithic UI store: Violates domain separation principle

## R8: Text-to-Speech (TTS) Implementation

**Decision**: Use the browser's Web Speech API (`SpeechSynthesis`) for text-to-speech. No external service dependency.

**Rationale**: The Web Speech API is available in Chromium (Electron's renderer), provides voice selection, rate/pitch control, and requires no API keys. The source project uses this approach. If users need higher-quality TTS, this can be extended to support external providers in a future feature.

## R9: Content Search Implementation

**Decision**: Implement in-chat search with a floating search bar (Ctrl+F / Cmd+F), text matching against rendered message content, and scroll-to-match with highlight overlay.

**Rationale**: In-chat search is a standard feature in messaging applications. The search operates on the client-side message store data, not the DOM. Matches are highlighted using mark elements or CSS highlight pseudo-element. The search bar overlays the chat area and cycles through matches with prev/next buttons.

## R10: React Flow Conversation Graph

**Decision**: Use @xyflow/react (React Flow) to visualize conversation branching. Nodes represent messages/topics, edges represent parent-child relationships. The graph is a separate view accessible via a toggle.

**Rationale**: React Flow is retained from the source project and provides node/edge rendering, zoom, pan, and layout algorithms. The conversation graph is a P3 feature that provides visual navigation for branched conversations.
