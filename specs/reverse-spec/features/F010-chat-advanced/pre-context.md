# F010 — Chat Advanced — Pre-Context

> Feature ID: F010 | Tier: 2 | Release Group: RG-4

---

## Source Reference

| Key Source Files | Purpose |
|-----------------|---------|
| `src/renderer/src/types/newMessage.ts` | ImageMessageBlock, ToolMessageBlock, CitationMessageBlock, ErrorMessageBlock, FileMessageBlock |
| `src/renderer/src/types/index.ts` | MCPToolResponse, multiModelMessageStyle, mentions, WebSearchResponse |
| `src/renderer/src/store/settings.ts` | foldDisplayMode, gridColumns, gridPopoverTrigger, pasteLongTextAsFile |
| `src/renderer/src/store/messageBlock.ts` | Block state management |
| `src/renderer/src/pages/home/` | Multi-model chat UI, block renderers |
| `src/renderer/src/aiCore/` | Multi-model dispatch |

---

## Source Behavior Inventory (SBI)

| ID | Source File | Function/Method | Behavior | Pri | Origin |
|----|-----------|----------------|----------|-----|--------|
| B114 | `types/newMessage.ts` | `mentions?: Model[]` | @-mention models in a message; triggers multi-model response | P1 | Source |
| B115 | `types/newMessage.ts` | `multiModelMessageStyle` | Layout modes: horizontal, vertical, fold, grid | P1 | Source |
| B116 | `types/newMessage.ts` | `foldSelected` | In fold mode, marks which response is the primary display | P1 | Source |
| B117 | `store/settings.ts` | `gridColumns` / `gridPopoverTrigger` | Grid layout: column count; popover trigger (hover/click) | P2 | Source |
| B118 | `types/newMessage.ts` | `ImageMessageBlock` | Image block: url or FileMetadata, with generation metadata | P1 | Source |
| B119 | `types/newMessage.ts` | `ToolMessageBlock` | Tool call block: toolId, toolName, arguments, content, rawMcpToolResponse | P1 | Source |
| B120 | `types/newMessage.ts` | `CitationMessageBlock` | Citations: web search response, knowledge references, memory items | P1 | Source |
| B121 | `types/newMessage.ts` | `ErrorMessageBlock` | Error display block with serialized error | P1 | Source |
| B122 | `types/newMessage.ts` | `FileMessageBlock` | File attachment display with FileMetadata | P2 | Source |
| B123 | `store/settings.ts` | `pasteLongTextAsFile` / `pasteLongTextThreshold` | Auto-convert long paste to file attachment when exceeding threshold | P2 | Source |
| B124 | `types/newMessage.ts` | `TranslationMessageBlock` | Inline translation of a block with source/target language | P2 | Source |
| B125 | `store/settings.ts` | `foldDisplayMode` | 'expanded' or 'compact' for fold layout | P2 | Source |
| B126 | `types/index.ts` | `MCPToolResponse` | Tool response with status lifecycle: pending -> streaming -> invoking -> done/error | P1 | Source |

---

## For /speckit.specify Hints

- Define multi-model dispatch protocol
- Specify each block type's rendering requirements
- Document fold/grid layout mechanics
- Define file attachment flow (select/paste -> upload -> attach to message)
- Specify context count management for long conversations

## For /speckit.plan Hints

- Task 1: Multi-model message dispatch
- Task 2: Layout mode components (horizontal, vertical, fold, grid)
- Task 3: Image block renderer
- Task 4: Tool call/response block renderer
- Task 5: Citation block renderer
- Task 6: File attachment system
- Task 7: Context management controls

---

## Feature Contracts

| Direction | Feature | Contract |
|-----------|---------|----------|
| Depends on F006 | Chat Core | Message/block architecture, streaming infrastructure |
| Depends on F005 | Model Management | Model list for @-mentions |
| Depends on F008 | Data & Storage | File upload for attachments |
| Depends on F012 | MCP Integration | Tool call/response data |
| Depends on F011 | Knowledge Base | Knowledge references in citations |
