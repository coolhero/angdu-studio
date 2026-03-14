# Pre-Context: F005-assistant

> Assistant CRUD, presets, tags, assistant-specific settings, default assistant
> Generated: 2026-03-14

---

## Feature Overview

F005-assistant manages the assistant entity lifecycle — creation, configuration, presets, tagging, and the default assistant. Assistants are the organizational unit that binds a system prompt, model selection, parameter settings, knowledge bases, and MCP servers into a reusable persona. Every chat conversation (F006) occurs within the context of an assistant.

### Key Responsibilities

1. **Assistant CRUD**: Create, read, update, delete assistants with full configuration
2. **Default Assistant**: System-provided default assistant that exists on first launch
3. **Assistant Settings**: Per-assistant model parameter overrides (temperature, maxTokens, contextCount, reasoning_effort, etc.)
4. **Presets**: Reusable assistant configuration templates
5. **Tags**: User-defined tags for organizing and filtering assistants
6. **Assistant Library**: Browsable store of assistant templates (My / Featured sections)
7. **Settings Normalization**: Validation and clamping of settings values (BR-028)
8. **Reasoning Effort Sync**: Auto-sync reasoning_effort when model changes (BR-029)
9. **Translate Assistant**: Specialized configuration for translation use case (BR-030)

### Boundaries

- Does NOT own model/provider entities (F003-provider owns those)
- Does NOT own conversation/topic management (F006-chat owns topics)
- Does NOT own knowledge base operations (F007-knowledge owns KB entities)
- Does NOT own MCP server lifecycle (F008-mcp owns server entities)
- DOES own the Assistant entity, AssistantSettings, AssistantPreset, and tags
- DOES own the sidebar assistant list and assistant library UI

---

## Runtime Exploration Results

### Screen: #/ — Home Sidebar (Assistants Tab)

**Layout**: Left sidebar (275px) within Home screen, toggled between Assistants and Topics tabs.

| Element | Description |
|---------|-------------|
| Assistants tab (active) | Shows list of all assistants with emoji icons |
| "+ Add Assistant" button | Opens assistant creation flow |
| Assistant list items | Each shows emoji + name, context menu (right-click or "..." button) |
| Context menu actions | Edit, Duplicate, Pin, Export, Delete |
| Default Assistant | Pre-created system assistant, always present, cannot be deleted |
| Drag reorder | Assistants can be reordered via drag-and-drop |

### Screen: #/store — Assistant Library

**Layout**: Top navbar tab + Left sidebar (My/Featured tabs) + Main content grid.

| Element | Description |
|---------|-------------|
| Left sidebar | "My" (user-created) and "Featured" (curated) tabs with counts |
| Header actions | Search, Import from External, Manage Assistants, + Create Assistant |
| Content grid | Assistant cards with name, description, emoji, tags |
| Empty state | "No results found" illustration |

### Screen: Assistant Settings (within chat header)

**Layout**: Accessed via gear icon in chat header, opens settings panel.

| Element | Description |
|---------|-------------|
| Model selector | Dropdown to choose/change the assistant's default model |
| Temperature slider | 0-2 range with 0.1 step |
| Max tokens input | Numeric input with enable toggle |
| Context count | Number of previous messages to include (0 = unlimited) |
| Top P slider | 0-1 range |
| Frequency/Presence penalty | -2 to 2 range sliders |
| Stream output toggle | Enable/disable streaming responses |
| Reasoning effort | Low/Medium/High selector (visible only for reasoning models) |
| Custom parameters | Key-value pair list for arbitrary model params |
| Knowledge bases | Multi-select linked knowledge bases |
| MCP servers | Multi-select linked MCP servers |
| Web search toggle | Enable/disable web search augmentation |

### User Flows

| Flow | Steps | Observations |
|------|-------|--------------|
| Create assistant | "+ Add Assistant" -> Fill name/prompt/settings -> Save | New assistant appears in sidebar list |
| Edit assistant | Right-click assistant -> Edit -> Modify fields -> Save | Changes apply to future conversations |
| Use preset | Assistant Library -> Select preset -> "Use" | Creates new assistant from preset template |
| Change model | Chat header -> Model dropdown -> Select model | Triggers reasoning effort auto-sync (BR-029) |
| Tag management | Edit assistant -> Tags field -> Add/remove tags | Tags used for filtering in library |

---

## Source Reference

> All paths relative to cherry-studio root.

### Primary Source Files

| Path | Description | Lines (approx) |
|------|-------------|----------------|
| `src/renderer/src/store/assistants.ts` | Assistants Redux slice — CRUD reducers, selectors | ~300 |
| `src/renderer/src/services/AssistantService.ts` | Assistant service — normalization, sync logic | ~200 |
| `src/renderer/src/hooks/useAssistant.ts` | Assistant React hooks — current assistant, operations | ~150 |
| `src/renderer/src/hooks/useAssistantPresets.ts` | Preset hooks — load, apply, manage presets | ~100 |
| `src/renderer/src/types/index.ts` | Assistant, AssistantSettings type definitions | ~80 (partial) |
| `src/renderer/src/pages/home/components/` | Assistant sidebar UI components | ~10 files |
| `src/renderer/src/pages/settings/AssistantSettings/` | Assistant settings pages/panels | ~5 files |
| `src/renderer/src/pages/store/` | Assistant library (store page) UI | ~8 files |

### Key Types & Interfaces

| Type | Location | Description |
|------|----------|-------------|
| `Assistant` | `types/index.ts` | Core entity: id, name, prompt, topics[], model, settings, knowledge_bases[], mcpServers[], tags, emoji, type |
| `AssistantSettings` | `types/index.ts` | Parameter overrides: maxTokens, temperature, topP, contextCount, streamOutput, reasoning_effort, etc. |
| `AssistantPreset` | `types/index.ts` | Reusable template: id, name, prompt, settings, tags |

---

## Source Behavior Inventory (SBI)

### Assistant CRUD (B121-B128)

| ID | Behavior | Source File(s) | BR | Priority |
|----|----------|---------------|-----|----------|
| B121 | Create assistant with uuid, name, prompt, default settings, empty topics/knowledge/mcp arrays | `store/assistants.ts` | — | MUST |
| B122 | Update assistant fields (name, prompt, emoji, model, settings, tags, etc.) with partial update support | `store/assistants.ts` | — | MUST |
| B123 | Delete assistant with confirmation — removes assistant and all owned topics | `store/assistants.ts` | — | MUST |
| B124 | Duplicate assistant — deep clone with new uuid and "(Copy)" suffix on name | `store/assistants.ts` | — | SHOULD |
| B125 | Default Assistant exists on first launch, cannot be deleted, used as fallback | `store/assistants.ts` | — | MUST |
| B126 | Assistant list ordering via drag-and-drop reorder, persisted to store | `store/assistants.ts` | — | SHOULD |
| B127 | Pin assistant to top of sidebar list | `store/assistants.ts` | — | COULD |
| B128 | Export assistant configuration as JSON for sharing | `services/AssistantService.ts` | — | COULD |

### Assistant Settings (B129-B136)

| ID | Behavior | Source File(s) | BR | Priority |
|----|----------|---------------|-----|----------|
| B129 | Settings normalization: contextCount special values (0=unlimited, negative=default), clamped to provider max | `services/AssistantService.ts` | BR-028 | MUST |
| B130 | Settings normalization: maxTokens validated against model's max output tokens, clamped to valid range | `services/AssistantService.ts` | BR-028 | MUST |
| B131 | Reasoning effort auto-sync: on model change, apply model's default if model supports reasoning, clear if not | `services/AssistantService.ts` | BR-029 | MUST |
| B132 | Stream output toggle: enable/disable streaming responses per assistant | `types/index.ts` | — | MUST |
| B133 | Custom parameters: arbitrary key-value pairs passed to model API | `types/index.ts` | — | SHOULD |
| B134 | Default reply language: preferred response language override | `types/index.ts` | — | COULD |
| B135 | Auto-reset model: reset model selection per new conversation | `types/index.ts` | — | COULD |
| B136 | Temperature, topP, frequencyPenalty, presencePenalty range validation on save | `services/AssistantService.ts` | BR-028 | MUST |

### Translate Assistant (B137-B139)

| ID | Behavior | Source File(s) | BR | Priority |
|----|----------|---------------|-----|----------|
| B137 | Translate assistant type auto-disables reasoning (reasoning_effort = null) | `services/AssistantService.ts` | BR-030 | MUST |
| B138 | Translate assistant injects specialized translation system prompt | `services/AssistantService.ts` | BR-030 | SHOULD |
| B139 | Translate assistant adjusts temperature for translation accuracy | `services/AssistantService.ts` | BR-030 | SHOULD |

### Presets & Library (B140-B145)

| ID | Behavior | Source File(s) | BR | Priority |
|----|----------|---------------|-----|----------|
| B140 | Assistant presets: save current assistant config as reusable template | `hooks/useAssistantPresets.ts` | — | SHOULD |
| B141 | Apply preset to create new assistant from template (deep clone settings) | `hooks/useAssistantPresets.ts` | — | SHOULD |
| B142 | Assistant library "My" tab: shows user-created assistants | `pages/store/` | — | SHOULD |
| B143 | Assistant library "Featured" tab: shows curated/imported assistants | `pages/store/` | — | COULD |
| B144 | Import assistant from external source (JSON file or URL) | `pages/store/` | — | COULD |
| B145 | Search/filter assistants by name, tags, description in library | `pages/store/` | — | SHOULD |

### Tags & Organization (B146-B148)

| ID | Behavior | Source File(s) | BR | Priority |
|----|----------|---------------|-----|----------|
| B146 | Add/remove tags on assistant — free-form string tags | `store/assistants.ts` | — | SHOULD |
| B147 | Filter assistant list by tag selection | `hooks/useAssistant.ts` | — | SHOULD |
| B148 | Assistant grouping (group field) for sidebar display organization | `store/assistants.ts` | — | COULD |

### Cross-Feature Links (B149-B152)

| ID | Behavior | Source File(s) | BR | Priority |
|----|----------|---------------|-----|----------|
| B149 | Link/unlink knowledge bases to assistant (stores KB IDs in assistant) | `store/assistants.ts` | — | SHOULD |
| B150 | Link/unlink MCP servers to assistant (stores server IDs in assistant) | `store/assistants.ts` | — | SHOULD |
| B151 | Model reference resolution: assistant.model references Provider/Model from F003 | `hooks/useAssistant.ts` | — | MUST |
| B152 | Web search toggle: enable/disable per-assistant web search augmentation | `store/assistants.ts` | — | SHOULD |

---

## Environment Variables

| Variable | Purpose | Used By |
|----------|---------|--------|
| None | F005 has no environment variables | — |

All configuration is stored in the Redux/Zustand assistant store and persisted via middleware.

---

## For /speckit.specify

### Entity Ownership

F005 owns:
- **Assistant** — Core entity (see entity-registry.md for full schema)
- **AssistantSettings** — Embedded value object within Assistant
- **AssistantPreset** — Reusable configuration template

F005 references (read-only):
- **Model** (F003) — via `assistant.model`
- **KnowledgeBase** (F007) — via `assistant.knowledge_bases[]` IDs
- **MCPServer** (F008) — via `assistant.mcpServers[]` IDs

### Business Rules Owned

BR-028 (Settings Normalization), BR-029 (Reasoning Effort Auto-Sync), BR-030 (Translate Assistant Configuration).

### Acceptance Criteria Focus

1. Assistant CRUD operations work correctly with store persistence
2. Default assistant exists on first launch and cannot be deleted
3. Settings normalization clamps values to valid ranges
4. Reasoning effort auto-syncs when model changes
5. Translate assistant type correctly disables reasoning and sets specialized config
6. Assistant library displays and filters assistants by tags/search
7. Presets can be saved from and applied to assistants

---

## For /speckit.plan

### Migration Impact

- **UI Impact**: Medium — Assistant sidebar, library page, and settings panels use AntD components (Form, Input, Select, Slider, Switch, Modal, Drawer). All must be rewritten with shadcn/ui equivalents.
- **State Impact**: Medium — `assistants` Redux slice migrates to `useAssistantStore` (Zustand). Reducers become store actions, selectors become Zustand selectors.

### Implementation Order

1. **Phase 1**: Assistant types and `useAssistantStore` (Zustand store with persist)
2. **Phase 2**: AssistantService — normalization logic (BR-028, BR-029, BR-030)
3. **Phase 3**: Assistant CRUD operations and default assistant initialization
4. **Phase 4**: Assistant sidebar UI (list, reorder, context menu)
5. **Phase 5**: Assistant settings panel (model selector, parameter controls)
6. **Phase 6**: Presets, library page, import/export

### Dependencies to Resolve First

- F003-provider must provide `Model` type and model listing for model selector dropdown
- F001-app-shell must provide window/layout context for sidebar rendering
- F002-settings must be established for app-wide settings that affect assistants

### Zustand Store Design

```typescript
// useAssistantStore — absorbs Cherry's assistants + assistant slices
interface AssistantStore {
  assistants: Assistant[]
  defaultAssistant: Assistant
  // Actions
  addAssistant: (assistant: Partial<Assistant>) => Assistant
  updateAssistant: (id: string, updates: Partial<Assistant>) => void
  deleteAssistant: (id: string) => void
  duplicateAssistant: (id: string) => Assistant
  reorderAssistants: (ids: string[]) => void
  // Selectors
  getAssistantById: (id: string) => Assistant | undefined
  getAssistantsByTag: (tag: string) => Assistant[]
}
```

### AntD -> shadcn/ui Component Mapping for F005

| AntD Usage | shadcn/ui Replacement |
|------------|----------------------|
| Form + Form.Item | React Hook Form + FormField |
| Input | Input |
| Select (model picker) | Select / Combobox |
| Slider (temperature, etc.) | Slider |
| Switch (toggles) | Switch |
| Modal (confirm delete) | AlertDialog |
| Drawer (edit panel) | Sheet |
| Tag | Badge (custom variant) |
| Dropdown (context menu) | DropdownMenu |

---

## Feature Contracts

### Provided Contracts (F005 exposes)

| Contract | Consumer(s) | Description |
|----------|-------------|-------------|
| `useAssistantStore.assistants` | F006-chat, F004-ai-core | List of all assistants |
| `useAssistantStore.getAssistantById(id)` | F006-chat | Resolve assistant for conversation context |
| `useAssistantStore.defaultAssistant` | F006-chat | Fallback assistant when none selected |
| `AssistantService.normalizeSettings(settings, model)` | F004-ai-core | Normalized settings for API request construction |
| `Assistant` type | F004-ai-core, F006-chat | Entity type definition |
| `AssistantSettings` type | F004-ai-core | Settings type for completion config |

### Required Contracts (F005 depends on)

| Contract | Provider | Description |
|----------|----------|-------------|
| `Model` type + model listing | F003-provider | Model selector dropdown, model reference resolution |
| `Provider` type | F003-provider | Provider capabilities for settings normalization |
| `KnowledgeBase` IDs | F007-knowledge | Linkable knowledge base references |
| `MCPServer` IDs | F008-mcp | Linkable MCP server references |
| Window/layout context | F001-app-shell | Sidebar rendering context |

### Naming Remapping

| Cherry Studio | Angdu Studio |
|---------------|--------------|
| `cherry-studio` references in prompts | `angdu-studio` |
| `cs:` IPC prefix (if any) | `as:` IPC prefix |
