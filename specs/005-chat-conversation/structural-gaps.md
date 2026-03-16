# F005 Chat Conversation — Structural Gaps (Guard 3, 7)

> Source app (Cherry Studio) vs Target app (Angdu Studio) structural comparison.
> Each gap is classified: CRITICAL (affects downstream features), HIGH (affects UX), MEDIUM (detail difference).

## Gap Summary

| # | Gap | Severity | Affects |
|---|-----|----------|---------|
| G5-01 | No right-side topic panel (topicPosition=right) | HIGH | Source supports topics on right as separate panel |
| G5-02 | No agent session branch | HIGH | Source has full agent session system (messages, inputbar, todo) |
| G5-03 | Message grouping by date missing | MEDIUM | Source groups messages with date separators |
| G5-04 | Inputbar tools system absent | HIGH | Source has 18 draggable tool buttons; target has only attach |
| G5-05 | 5 block types missing | MEDIUM | Video, Translation, Citation, Placeholder, Compact blocks absent |
| G5-06 | Message actions reduced | MEDIUM | Source: 8+ actions. Target: 4 actions (copy, edit, regenerate, delete) |
| G5-07 | Scroll strategy fundamentally different | MEDIUM | Source: reverse column-reverse. Target: forward virtual scroll |
| G5-08 | No content search (Ctrl+F) | MEDIUM | Source has find-in-chat with user/assistant filter |
| G5-09 | No narrow mode | MEDIUM | Source has max-width 800px toggle |
| G5-10 | No multi-select mode | MEDIUM | Source supports bulk message selection |
| G5-11 | AssistantEditor high control density | HIGH | 10+ controls in single dialog — risk of incomplete verification |
| G5-12 | EventEmitter → Zustand paradigm shift | MEDIUM | Source uses pub/sub events; target uses direct store access |
| G5-13 | No DnD assistant reorder | MEDIUM | Source supports drag-to-reorder assistants |
| G5-14 | No scroll position persistence per topic | MEDIUM | Source remembers scroll position per topic |

## Detailed Analysis

### G5-01: No Right-Side Topic Panel (HIGH)

**Source behavior**: `topicPosition` setting allows topics to appear either:
- Left: tabbed with assistants in HomeTabs
- Right: separate animated panel on the right side of Chat

This creates a 3-column layout: Assistants (left) | Chat (center) | Topics (right).

**Target behavior**: Topics are always in the left sidebar, tabbed with assistants. Only a 2-column layout exists: Sidebar (left) | Chat (right).

**Impact**: Different spatial layout. Users who prefer seeing topics while browsing assistants cannot. However, the target's simpler layout is functional and avoids the complexity of managing two independent panels.

### G5-02: No Agent Session Branch (HIGH)

**Source behavior**: `activeTopicOrSession` state branches the entire Chat component:
- `'topic'` → standard topic-based chat (Messages + Inputbar)
- `'session'` → agent session (AgentSessionMessages + AgentSessionInputbar + PinnedTodoPanel)

Agent sessions have different message rendering, input handling, and panel layout.

**Target behavior**: Only topic-based chat exists. No agent session concept.

**Impact**: Agent sessions are a T2+ feature. This is an expected gap that will be resolved when agent features are implemented. Not blocking for T1.

### G5-03: Message Grouping by Date (MEDIUM)

**Source behavior**: `getGroupedMessages()` creates `MessageGroup` components that group messages by date, with date separator headers.

**Target behavior**: Flat message list with no date grouping or separators.

**Impact**: Visual organization in long conversations. Easy to add later.

### G5-04: Inputbar Tools System (HIGH)

**Source behavior**: Sophisticated tool plugin system:
- `InputbarToolsProvider` context provides tool registry
- `InputbarTools` renders 18 draggable tool buttons
- Each tool has a `.tsx` definition + button component
- Tools: Attachment, NewTopic, ClearTopic, WebSearch, KnowledgeBase, MCP, ImageGen, Expand, QuickPhrases, SlashCommands, Thinking, MentionModels, Resource, UrlContext, NewContext, CreateSession, ToggleExpand
- Tool visibility configurable, order drag-reorderable

**Target behavior**: Only a Paperclip (file attach) button exists in MessageInput.

**Impact**: Many input tools depend on future features (F006 Knowledge, F007 MCP, F009 WebSearch). The tool framework itself (registry, draggable bar, context) is the structural gap. Individual tools should be added as their features are implemented, but the framework should be considered for the tools architecture.

### G5-05: Block Types Missing (MEDIUM)

**Source**: 12 block types (MainText, Thinking, Tool, ToolGroup, Image, File, Video, Error, Translation, Citation, Placeholder, Compact)
**Target**: 7 block types (main_text, code, thinking, tool, image, file, error)

Missing:
- **VideoBlock**: Video content rendering → out of T1 scope
- **TranslationBlock**: In-message translation → out of scope
- **CitationBlock**: Source citations → out of scope
- **PlaceholderBlock**: Loading indicator → target uses animated pulse instead
- **CompactBlock**: Collapsed view → out of scope

**Impact**: Missing blocks are tied to features not yet implemented. PlaceholderBlock is replaced by a pulse animation. Not blocking.

### G5-06: Message Actions Reduced (MEDIUM)

**Source MessageMenubar**: copy, edit, resend, regenerate, branch, translate, TTS, bookmark, delete, multi-select
**Target MessageActions**: copy, edit, regenerate, delete

Missing: resend (separate from regenerate), branch (create topic from message), translate, TTS, bookmark, multi-select toggle.

**Impact**: Power-user features. Branch and bookmark are useful for conversation management. Could be added incrementally.

### G5-07: Scroll Strategy Different (MEDIUM)

**Source**: `column-reverse` CSS + `react-infinite-scroll-component` (inverse mode). Messages stored in reverse order, newest at bottom naturally.

**Target**: `@tanstack/react-virtual` with forward order. `scrollToIndex` for auto-scroll. `IntersectionObserver` for load-more.

**Impact**: Both achieve the same UX (newest messages at bottom, scroll up for history). Implementation differs but functionality is equivalent. Target's virtual scroll is more performant for large conversations.

### G5-08 through G5-10: Missing Features (MEDIUM)

Content search, narrow mode, and multi-select are convenience features that don't affect the structural integrity of the chat system. All can be added independently.

### G5-11: AssistantEditor High Control Density (HIGH)

**AssistantEditor** contains 10+ interactive controls in a single dialog:
- Name input, Emoji picker, Description textarea, System prompt textarea
- Model selector (Popover with search + grouped list)
- Category input, Tags input
- Temperature slider, TopP slider, MaxTokens slider, ContextCount slider

**Risk**: Individual controls may not be adequately verified during pipeline. The UI Control Density Check (Guard 4c) flags this as needing control-level SBI decomposition.

**Impact**: Verification completeness. Each slider and selector should be independently tested for correct persistence and value range.

### G5-12: EventEmitter → Zustand Paradigm Shift (MEDIUM)

**Source**: 30+ event types via EventEmitter pub/sub (SEND_MESSAGE, CLEAR_MESSAGES, NEW_CONTEXT, SCROLL_TO_BOTTOM, etc.). Components communicate via events.

**Target**: Zustand stores with direct `getState()` calls and selector subscriptions. No event bus.

**Impact**: Architectural choice. Zustand approach is simpler and more traceable. Event-driven patterns may need to be reconsidered if complex cross-component coordination is needed (e.g., inputbar tools triggering message list scroll).

### G5-13: No DnD Assistant Reorder (MEDIUM)

**Source**: `DraggableList` / `Sortable` in AssistantsTab allows drag-to-reorder assistants.
**Target**: Static category-grouped list with no reordering.

### G5-14: No Scroll Position Persistence (MEDIUM)

**Source**: `useScrollPosition` hook remembers and restores scroll position per topic.
**Target**: Always scrolls to bottom when switching topics.

**Impact**: UX regression for users who switch between topics frequently and want to resume reading where they left off.

## Recommendations

| Gap | Action | Priority |
|-----|--------|----------|
| G5-01 | Keep 2-column layout for T1. Reassess if users request right-side topics | Defer |
| G5-02 | Expected gap — agent sessions are T2+ scope | Defer |
| G5-03 | Add date grouping to MessageList — low effort, high UX value | Recommended before F006 |
| G5-04 | Design inputbar tools framework architecture for F007 planning phase | Defer to F007 plan |
| G5-05 | Add block types as their features are implemented | Defer |
| G5-06 | Consider adding branch and bookmark to MessageActions | Low priority |
| G5-07 | Keep current approach — virtual scroll is more performant | Keep as-is |
| G5-08 | Content search can be added independently | Defer |
| G5-09 | Narrow mode is a niche feature | Defer |
| G5-10 | Multi-select can be added independently | Defer |
| G5-11 | Ensure AssistantEditor controls are individually verified in any future re-verify | **Recommended** |
| G5-12 | Keep Zustand approach — simpler and more traceable | Keep as-is |
| G5-13 | Add DnD if assistant management becomes a pain point | Defer |
| G5-14 | Consider implementing scroll persistence — moderate effort, good UX | Recommended |
