# F005 Chat Conversation — Interaction Surfaces

> Guard 6b artifact. All user-facing interaction points in the chat system.

## Current Implementation

| # | Surface | Component | Type | Verified |
|---|---------|-----------|------|----------|
| 1 | Send message | MessageInput | click / Enter or Ctrl+Enter → sendMessage | ✅ Code review |
| 2 | Stop streaming | MessageInput | click → stopGeneration | ✅ Code review |
| 3 | File attach | MessageInput (Paperclip) | click → file picker | ✅ Code review |
| 4 | TipTap rich text editor | MessageInput | type → draft management | ✅ Code review |
| 5 | Cancel edit mode | MessageInput | click → exit edit mode | ✅ Code review |
| 6 | Model selector | ChatHeader → ModelSelector | click → Popover with search | ✅ Code review |
| 7 | Toggle sidebar | ChatHeader (PanelLeft) | click → toggle sidebarVisible | ✅ Code review |
| 8 | Copy message | MessageActions | hover + click → clipboard via IPC | ✅ Code review |
| 9 | Edit message | MessageActions | hover + click → load into MessageInput | ✅ Code review |
| 10 | Regenerate response | MessageActions | hover + click → delete + re-send | ✅ Code review |
| 11 | Delete message | MessageActions | hover + click → delete | ✅ Code review |
| 12 | Error block retry | ErrorBlock | click → regenerate | ✅ Code review |
| 13 | Thinking block toggle | ThinkingBlock | click → expand/collapse | ✅ Code review |
| 14 | Code block copy | CodeBlock | click → copy code | ✅ Code review |
| 15 | Scroll to bottom | ScrollToBottom | click → scroll to latest | ✅ Code review |
| 16 | Load more messages | MessageList | scroll to top (IntersectionObserver) → loadMore | ✅ Code review |
| 17 | Select assistant | AssistantList | click → setActive, switch to topics | ✅ Code review |
| 18 | Edit assistant | AssistantList | hover + Pencil → AssistantEditor dialog | ✅ Code review |
| 19 | Delete assistant | AssistantList | hover + Trash → confirm + delete | ✅ Code review |
| 20 | Create assistant | HomeSidebar toolbar | click + → AssistantEditor dialog | ✅ Code review |
| 21 | Import assistants | HomeSidebar toolbar | click → file picker → JSON import | ✅ Code review |
| 22 | Export assistants | HomeSidebar toolbar | click → save dialog → JSON export | ✅ Code review |
| 23 | Search assistants | HomeSidebar | type → filter assistant list | ✅ Code review |
| 24 | Select topic | TopicList | click → switch topic, load messages | ✅ Code review |
| 25 | Rename topic | TopicList context menu | click Pencil → inline edit | ✅ Code review |
| 26 | Delete topic | TopicList context menu | click Trash → confirm + delete | ✅ Code review |
| 27 | Create topic | HomeSidebar toolbar | click + → new topic | ✅ Code review |
| 28 | Tab switcher | HomeSidebar | click tab → switch Assistants/Topics | ✅ Code review |
| 29 | Dismiss error banner | ChatArea | click X → clear error | ✅ Code review |
| 30 | AssistantEditor: Temperature slider | AssistantEditor | drag → set temperature | ✅ Code review |
| 31 | AssistantEditor: TopP slider | AssistantEditor | drag → set topP | ✅ Code review |
| 32 | AssistantEditor: MaxTokens slider | AssistantEditor | drag → set maxTokens | ✅ Code review |
| 33 | AssistantEditor: ContextCount slider | AssistantEditor | drag → set contextCount | ✅ Code review |
| 34 | AssistantEditor: Model selector | AssistantEditor | click → popover model selection | ✅ Code review |

## Controls in Source but Not in Target

| Source Control | Reason |
|----------------|--------|
| InputbarTools (18 draggable tool buttons) | deferred — only Paperclip exists |
| @mention models | deferred — no QuickPanel |
| Quick phrases (/) | deferred — no quick phrase trigger |
| Multi-select mode (checkbox) | deferred |
| Content search (Ctrl+F) | deferred |
| Message branching (branch topic) | deferred |
| Message translation | deferred |
| TTS (text-to-speech) | deferred |
| Message bookmark | deferred |
| Narrow mode toggle | removed |
| Global search (SearchPopup) | deferred |
| DnD assistant reorder | deferred — target uses static category grouping |
| Topic pin toggle | deferred — model has pinned field but no UI control |
| Topic export/clear | deferred |
| ChatFlowHistory graph view | removed |
| Scroll position persistence per topic | deferred |
| Token count display in input | deferred |
| New context marker insertion | deferred |
| Image paste / file drop in editor | deferred — attach button exists but paste/drop not wired |
| AssistantsDrawer (hamburger) | removed — sidebar always available |
| Agent session branch | deferred (T2+ scope) |
