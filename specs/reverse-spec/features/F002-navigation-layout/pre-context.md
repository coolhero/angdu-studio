# F002 — Navigation & Layout — Pre-Context

> Feature ID: F002 | Tier: 1 | Release Group: RG-2

---

## Source Reference

| Key Source Files | Purpose |
|-----------------|---------|
| `src/renderer/src/store/tabs.ts` | Tab state management (add, remove, set active, update, DnD) |
| `src/renderer/src/store/settings.ts` | showAssistants, showTopics, topicPosition settings |
| `src/renderer/src/Router.tsx` | React Router (HashRouter) route definitions |
| `src/renderer/src/App.tsx` | Root layout with sidebar + content area |
| `src/renderer/src/pages/home/` | Home/chat page layout |
| `src/renderer/src/components/` | Sidebar, TabBar components |
| `src/main/ipc.ts` | Windows_* IPC handlers |

---

## Source Behavior Inventory (SBI)

| ID | Source File | Function/Method | Behavior | Pri | Origin |
|----|-----------|----------------|----------|-----|--------|
| B016 | `store/tabs.ts` | `addTab()` | Adds tab if path doesn't exist; deduplicates by path; activates the tab | P1 | Source |
| B017 | `store/tabs.ts` | `removeTab()` | Removes tab by ID; if active tab closed, activates last remaining tab | P1 | Source |
| B018 | `store/tabs.ts` | `setTabs()` | Replaces entire tabs array (used for DnD reorder) | P1 | Source |
| B019 | `store/tabs.ts` | `initialState` | Default state: single "home" tab at path "/" with id "home" | P1 | Source |
| B020 | `store/tabs.ts` | `setActiveTab()` | Sets active tab by ID | P1 | Source |
| B021 | `store/settings.ts` | `showAssistants` / `showTopics` | Boolean toggles for sidebar panel visibility | P1 | Source |
| B022 | `store/settings.ts` | `topicPosition` | 'left' or 'right' — configures topic list position in sidebar | P2 | Source |
| B023 | `Router.tsx` | Route definitions | HashRouter with routes: /, /chat/:id, /settings, /knowledge, /files, /history | P1 | Source |
| B024 | `ipc.ts` | `Windows_Minimize/Maximize/Close` | Window control buttons trigger IPC to main process | P1 | Source |
| B025 | `ipc.ts` | `Windows_MaximizedChanged` | Main pushes maximize state changes to renderer for button UI update | P1 | Source |
| B026 | `store/settings.ts` | `clickAssistantToShowTopic` | When true, clicking an assistant shows its topic list | P2 | Source |
| B027 | `store/settings.ts` | `pinTopicsToTop` | Pinned topics appear at top of topic list | P2 | Source |

---

## For /speckit.specify Hints

- Define tab lifecycle: creation, deduplication, closing, minimum-one invariant
- Define sidebar layout modes and toggle behavior
- Specify DnD tab reorder interaction
- Document routing table with path parameters

## For /speckit.plan Hints

- Task 1: Tab store (Zustand) with persist
- Task 2: TabBar component with DnD
- Task 3: Sidebar layout with assistants/topics panels
- Task 4: React Router setup with HashRouter
- Task 5: Window control buttons (macOS traffic lights vs custom)

---

## Feature Contracts

| Direction | Feature | Contract |
|-----------|---------|----------|
| Depends on F001 | Electron Shell | MainWindow, window state events, minimize/maximize/close IPC |
| Depends on F009 | i18n | Translated labels for tabs, sidebar items |
| Provides to F006 | Chat Core | Route navigation to /chat/:assistantId |
| Provides to F007 | Settings System | Route navigation to /settings |
