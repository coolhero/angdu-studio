# F004-assistants Pre-Context

> Feature: Assistant presets, library/store, customization (name, prompt, emoji, model assignment), assistant CRUD
> Tier: 1 | Screen: `#/store` (Assistant Library), left sidebar on Home
> Dependencies: F003-providers (model selection)

---

## 1. Runtime Exploration Results

| Screen / Route | What Happens | Key Observation |
|---|---|---|
| `#/` (Home) left sidebar | Lists user assistants with emoji, name, model badge; click selects assistant; right-click context menu for edit/delete/duplicate | Sidebar uses `showAssistants` toggle from settings |
| `#/store` | Browse preset assistant library organized by groups; click "Add" creates assistant from preset | Uses `AssistantPreset` type with group field |
| Assistant edit drawer | Modal/drawer to edit name, emoji, prompt, model assignment, settings (temperature, context count, max tokens, stream, etc.) | Settings are `Partial<AssistantSettings>` |
| Topic management | Each assistant owns topics array; add/remove/rename/clear topics | Topics are nested within Assistant state |

## 2. Source Reference

| File Path (cherry-studio) | Role | Rebuild Target |
|---|---|---|
| `src/renderer/src/store/assistants.ts` | Redux slice: assistants CRUD, topics, presets, tags, unified list order | `[TBD]` |
| `src/renderer/src/services/AssistantService.ts` | Service: default assistant factory, settings normalization, provider lookup | `[TBD]` |
| `src/renderer/src/pages/store/assistants/presets/AssistantPresetsPage.tsx` | Preset library page UI | `[TBD]` |
| `src/renderer/src/pages/store/assistants/presets/components/` | Preset card/list components | `[TBD]` |
| `src/renderer/src/types/index.ts` (Assistant, AssistantPreset, AssistantSettings, Topic) | Shared type definitions | `[TBD]` |
| `src/renderer/src/pages/home/components/AssistantsDrawer.tsx` | Drawer for editing assistant properties | `[TBD]` |

## 3. Source Behavior Inventory (SBI)

| ID | Behavior | Source Location | Category |
|---|---|---|---|
| B111 | `getDefaultAssistant()` creates template assistant with id='default', emoji, empty prompt, one default topic | `AssistantService.ts:75-87` | factory |
| B112 | `getDefaultTopic(assistantId)` creates topic with uuid, timestamps, default name from i18n | `AssistantService.ts:161-171` | factory |
| B113 | `DEFAULT_ASSISTANT_SETTINGS` provides default config: temperature disabled, maxTokens disabled, stream enabled, toolUseMode='function' | `AssistantService.ts:43-59` | constant |
| B114 | `getAssistantSettings(assistant)` normalizes settings with MAX_CONTEXT_COUNT->UNLIMITED conversion, maxTokens gating | `AssistantService.ts:228-255` | transform |
| B115 | `getAssistantById(id)` retrieves assistant from Redux state | `AssistantService.ts:257-260` | query |
| B116 | `createAssistantFromAgent(agent)` creates full assistant from preset, dispatches addAssistant, shows toast | `AssistantService.ts:262-283` | mutation |
| B117 | `getAssistantProvider(assistant)` resolves provider from assistant model, fallback to default provider | `AssistantService.ts:189-193` | query |
| B118 | `getProviderByModel(model)` resolves provider by model.provider id, cascading fallback | `AssistantService.ts:197-207` | query |
| B119 | `getDefaultModel()` reads default model from llm slice | `AssistantService.ts:177-179` | query |
| B120 | `getDefaultAssistantSettings()` reads current default assistant settings from Redux (not template) | `AssistantService.ts:157-159` | query |
| B121 | `addAssistant` reducer prepends assistant to list | `store/assistants.ts:59-61` | mutation |
| B122 | `removeAssistant` reducer filters by id | `store/assistants.ts:71-73` | mutation |
| B123 | `updateAssistant` reducer merges partial update by id | `store/assistants.ts:74-78` | mutation |
| B124 | `updateAssistantSettings` reducer merges partial settings, creates defaults if missing | `store/assistants.ts:79-100` | mutation |
| B125 | `insertAssistant` inserts at specific index with bounds check | `store/assistants.ts:62-70` | mutation |
| B126 | `updateDefaultAssistant` replaces default assistant state | `store/assistants.ts:52-55` | mutation |
| B127 | `addTopic` adds topic to assistant's topics with dedup by id | `store/assistants.ts:124-136` | mutation |
| B128 | `removeTopic` filters topic out of assistant's list | `store/assistants.ts:137-146` | mutation |
| B129 | `updateTopic` replaces topic by id, clears messages, sets updatedAt | `store/assistants.ts:147-162` | mutation |
| B130 | `removeAllTopics` clears all topics via TopicManager, resets with default topic | `store/assistants.ts:175-186` | mutation |
| B131 | `setModel` assigns Model to assistant | `store/assistants.ts:197-206` | mutation |
| B132 | `setTagsOrder` / `updateTagCollapse` manages tag ordering and collapsed state | `store/assistants.ts:101-120` | mutation |
| B133 | `setUnifiedListOrder` sets order of mixed agent/assistant items | `store/assistants.ts:121-123` | mutation |
| B134 | `setAssistantPresets` / `addAssistantPreset` / `removeAssistantPreset` / `updateAssistantPreset` - CRUD on presets array | `store/assistants.ts:207-227` | mutation |
| B135 | `updateAssistantPresetSettings` merges partial settings into preset | `store/assistants.ts:228-243` | mutation |
| B136 | `selectAllTopics` selector flattens topics from all assistants | `store/assistants.ts:272-274` | query |
| B137 | `selectTopicsMap` selector creates Map<id, Topic> | `store/assistants.ts:276-281` | query |
| B138 | `getDefaultTranslateAssistant()` creates translate assistant with model, language, content prompt | `AssistantService.ts:97-144` | factory |

## 4. UI Component Features

| Component | Capability | Notes |
|---|---|---|
| Assistant sidebar list | Show/hide toggle, sort by tags/list, drag reorder, click to select, right-click context menu | `showAssistants`, `assistantsTabSortType` settings |
| Assistant edit drawer | Edit name, emoji, prompt, model selection, settings sliders | Opens as drawer/modal |
| Preset library page | Browse grouped presets, search, add to user assistants | `#/store` route |
| Preset cards | Display name, emoji, description, group badges | Grouped by `group[]` field |
| Tag management | Assign tags to assistants, order tags, collapse tag groups | `tagsOrder`, `collapsedTags` state |

## 5. Interaction Behavior Inventory

| Interaction | Behavior |
|---|---|
| Click assistant in sidebar | Selects assistant, loads first topic, shows chat |
| Right-click assistant | Context menu: Edit, Duplicate, Delete, Pin |
| Click "+" in sidebar | Opens default assistant creation or preset selection |
| Drag assistant in sidebar | Reorders via `setUnifiedListOrder` |
| Click preset in store | Shows preset details / "Add" button |
| Click "Add" on preset | `createAssistantFromAgent()` - creates assistant, shows success toast |
| Edit assistant settings | Opens drawer with temperature, context count, maxTokens, stream toggle |
| Assign model to assistant | Model selector sets `assistant.model` via `setModel` |

## 6. Foundation Decisions (Electron)

| Decision | Detail |
|---|---|
| State persistence | Redux store persisted via electron-store (assistants, presets, tags) |
| Topic data | Topics stored in assistant state; messages stored in separate DB via TopicManager |

## 7. Foundation Dependencies

| Dependency | Usage | New Stack Equivalent |
|---|---|---|
| `@reduxjs/toolkit` (createSlice) | Assistants state management | Zustand store |
| `lodash` (isEmpty, uniqBy) | Utility for topic deduplication | Native or lodash-es |
| `i18next` | Localized default names | i18next (same) |
| `uuid` | Generate assistant/topic IDs | `crypto.randomUUID()` or uuid |

## 8. Naming Remapping

| Original (Cherry) | Target (Angdu) | Location |
|---|---|---|
| No Cherry-specific naming found in assistant code | N/A | N/A |
| `cherryin` (painting provider in settings, not directly in assistant code) | `angduin` | Only if referenced in assistant context |

## 9. Static Resources

| Resource | Source Path | Notes |
|---|---|---|
| Default emoji `😀` | Hardcoded in `getDefaultAssistant()` | Keep as-is |
| Preset groups translations | `assistantPresetGroupTranslations.ts` | i18n keys |

## 10. Environment Variables

None specific to this feature.

## 11. Feature Contracts

### Provides (to other features)
- `Assistant` type and CRUD operations
- `getDefaultAssistant()`, `getDefaultTopic()` factories
- `getAssistantById()`, `getAssistantProvider()`, `getAssistantSettings()` queries
- `AssistantSettings` normalization
- Topic CRUD within assistants

### Consumes (from other features)
- F003-providers: `Model`, `Provider` types; `getStoreProviders()` for provider resolution
- F001-shell: Sidebar slot for assistant list

## 12. For /speckit.specify

- Assistant type has ~20 fields; rebuild should start with core fields (id, name, emoji, prompt, model, topics, settings, type)
- `AssistantSettings` has temperature/maxTokens/contextCount/streamOutput/toolUseMode/reasoning_effort
- Preset system (`AssistantPreset`) is separate from user assistants; presets use `group[]` instead of `topics[]`
- Topic ownership is 1:N (assistant has topics array); each topic has its own messages
- Tag system (tagsOrder, collapsedTags) allows organizing assistants by user-defined tags

## 13. For /speckit.plan

- Zustand store replacing Redux slice: `useAssistantsStore` with same state shape
- AssistantService can be a standalone module (no class needed)
- Preset library page needs new routing under `#/store`
- Assistant drawer needs shadcn/ui Sheet component
- Tag management and unified list order support drag-and-drop

## 14. For /speckit.analyze

- Redux selector `selectAllTopics` flattens across all assistants - potentially expensive; consider denormalized index
- `updateAssistantSettings` does per-key merge rather than replace - preserve this behavior
- `createAssistantFromAgent` dispatches to Redux then shows toast - in Zustand, combine store mutation + toast
- `getAssistantSettings` has special MAX_CONTEXT_COUNT -> UNLIMITED_CONTEXT_COUNT conversion logic
- Presets are stored in same Redux slice as assistants but as separate array
