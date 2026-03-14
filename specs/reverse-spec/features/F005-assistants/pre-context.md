# F005-assistants Pre-Context

## Feature Overview

| Field | Value |
|-------|-------|
| Feature ID | F005-assistants |
| Title | Assistant Management |
| Tier | 1 (Core) |
| Risk Group | RG-3 |
| Dependencies | F003-providers, F004-settings |
| SBI Range | B046 - B058 |

## Scope

Assistant CRUD operations, presets, assistant store/library, system prompts, model binding, and emoji avatars. This feature provides the entity layer that conversations (F006) attach to -- each assistant defines a persona with a system prompt, preferred model, and generation parameters.

## Migration Notes

- **Original**: Cherry Studio
- **Target**: Angdu Studio (Electron + React 19 + Zustand + Tailwind 4 + shadcn/ui + Vite 7)
- **Naming**: Cherry -> Angdu, CS -> AS, CherryStudio -> AngduStudio
- **State management**: Redux slices migrate to Zustand stores

## Key Source Files (relative to cherry-studio)

| Path | Role |
|------|------|
| src/renderer/src/store/assistants.ts | Redux assistants slice (CRUD, reorder, defaults) |
| src/renderer/src/pages/home/HomePage.tsx | Home page with assistant sidebar |
| src/renderer/src/pages/store/ | Assistant store/library page |
| src/renderer/src/types/ | Assistant type definitions |

## Source Behavior Inventory

| ID | Source File | Function/Method | Behavior Description | Priority | Origin |
|----|-------------|----------------|---------------------|----------|--------|
| B046 | store/assistants.ts | addAssistant() | Creates new assistant with name, emoji, system prompt | P1 | extracted |
| B047 | store/assistants.ts | updateAssistant() | Updates assistant configuration | P1 | extracted |
| B048 | store/assistants.ts | deleteAssistant() | Removes assistant and associated topics | P1 | extracted |
| B049 | store/assistants.ts | updateAssistantSettings() | Updates assistant-level settings (temperature, maxTokens) | P1 | extracted |
| B050 | store/assistants.ts | setDefaultAssistant() | Sets the default assistant for new conversations | P1 | extracted |
| B051 | pages/store/ | importPreset() | Imports assistant preset from external source | P2 | extracted |
| B052 | pages/store/ | exportPreset() | Exports assistant configuration as shareable preset | P2 | extracted |
| B053 | pages/store/ | searchPresets() | Searches preset library by name/tag | P2 | extracted |
| B054 | pages/home/ | renderAssistantSidebar() | Renders assistant list with DnD reordering | P1 | extracted |
| B055 | pages/home/ | showAssistantContextMenu() | Shows context menu (edit, duplicate, delete, pin) | P2 | extracted |
| B056 | store/assistants.ts | reorderAssistants() | Reorders assistant list via drag-and-drop | P2 | extracted |
| B057 | store/assistants.ts | duplicateAssistant() | Clones assistant with new ID | P3 | extracted |
| B058 | store/assistants.ts | importAssistants() | Bulk imports assistants from JSON | P3 | extracted |

## Priority Breakdown

| Priority | Count | IDs |
|----------|-------|-----|
| P1 | 6 | B046, B047, B048, B049, B050, B054 |
| P2 | 4 | B051, B052, B053, B055, B056 |
| P3 | 2 | B057, B058 |

## Dependency Graph

```
F003-providers ──┐
                 ├──> F005-assistants ──> F006-chat-core
F004-settings ───┘
```

- **F003-providers**: Assistants bind to a model, which requires provider configuration.
- **F004-settings**: Assistant-level settings (temperature, maxTokens) inherit/override global settings.

## Key Design Decisions for Angdu Studio

1. **Zustand over Redux**: The assistants slice migrates to a Zustand store with immer middleware for immutable updates.
2. **Emoji avatars**: Retain emoji-based avatar system; no image upload needed.
3. **Preset store**: The assistant store/library UI imports presets -- consider whether to keep remote fetch or make it local-only initially.
4. **DnD reordering**: Use @dnd-kit (React 19 compatible) instead of any legacy DnD library.
