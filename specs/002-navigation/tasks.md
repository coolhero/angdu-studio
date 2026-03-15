# Tasks: Navigation

**Input**: Design documents from `/specs/002-navigation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/navigation-api.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, create shared types and route registry

- [ ] T001 Install dependencies: react-router-dom, @dnd-kit/core, @dnd-kit/sortable in `package.json`
- [ ] T002 [P] Create shared navigation types (Tab, RouteConfig, NavbarPosition) in `src/shared/types/navigation.ts`
- [ ] T003 [P] Create route registry with all known routes, titles, icons, closable flags in `src/renderer/src/routes.tsx`
- [ ] T004 Add `navbarPosition`, `openTabs`, `activeTabId` to F001's AppConfig typed keys in `src/shared/types/config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Zustand tab store and HashRouter — all user stories depend on these

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create `useTabsStore` Zustand store with core actions (addTab with duplicate prevention — if tab with same route exists, activate it instead of creating new; removeTab; setActiveTab; reorderTabs) in `src/renderer/src/stores/useTabsStore.ts`
- [ ] T006 Create `Router.tsx` with HashRouter, lazy-loaded routes from route registry, catch-all redirect to "/" in `src/renderer/src/Router.tsx`
- [ ] T007 [P] Create placeholder page components (HomePage, SettingsPage, ChatPage, TranslatePage, KnowledgePage, FilesPage, NotesPage) in `src/renderer/src/pages/`

**Checkpoint**: Foundation ready — hash routing works, tab store functional, placeholder pages render

---

## Phase 3: User Story 1 - Hash-Based Page Routing and Tab Navigation (Priority: P1) 🎯 MVP

**Goal**: Users can navigate between pages via tabs in the top tab bar, with Home tab always present

**Independent Test**: Launch app → Home tab visible → navigate to settings → Settings tab appears → click tab → page switches → unknown route → redirects to home

### Implementation for User Story 1

- [ ] T008 [US1] Create `Navbar.tsx` inside content area with drag region (-webkit-app-region: drag) and WindowControls in `src/renderer/src/components/navigation/Navbar.tsx`
- [ ] T009 [US1] Create `TabBar.tsx` with horizontal tab list rendering from useTabsStore in `src/renderer/src/components/navigation/TabBar.tsx`
- [ ] T010 [US1] Create `TabItem.tsx` with title display, active state, click-to-navigate handler in `src/renderer/src/components/navigation/TabItem.tsx`
- [ ] T011 [US1] Wire TabBar into Navbar — tab click calls setActiveTab + react-router navigate
- [ ] T012 [US1] Ensure Home tab renders with closable=false and is always first in `src/renderer/src/components/navigation/TabBar.tsx`

**Checkpoint**: Tab bar visible with Home tab, clicking tabs navigates between pages, unknown routes redirect to home

---

## Phase 4: User Story 2 - Tab Lifecycle Management (Priority: P1)

**Goal**: Users can close tabs (X button, middle-click, context menu), with Home tab protected

**Independent Test**: Open tabs → close via X → navigates to adjacent tab → right-click → context menu → Close Others → only target + Home remain

### Implementation for User Story 2

- [ ] T013 [US2] Add close button to TabItem for non-Home tabs, wire to removeTab action in `src/renderer/src/components/navigation/TabItem.tsx`
- [ ] T014 [US2] Add middle-click handler (onAuxClick) to TabItem for quick close in `src/renderer/src/components/navigation/TabItem.tsx`
- [ ] T015 [US2] Create `TabContextMenu.tsx` with shadcn/ui ContextMenu (Close, Close Others, Close All) in `src/renderer/src/components/navigation/TabContextMenu.tsx`
- [ ] T016 [US2] Implement closeOthers and closeAll actions in useTabsStore in `src/renderer/src/stores/useTabsStore.ts`
- [ ] T017 [US2] Implement "navigate to adjacent tab on close" logic — when active tab is closed, activate the tab to the left (or Home if none) in `src/renderer/src/stores/useTabsStore.ts`

**Checkpoint**: Tabs closable via X, middle-click, and context menu. Home tab protected. Adjacent tab activated on close.

---

## Phase 5: User Story 7 - Frameless Window Drag Region in Navbar (Priority: P1)

**Goal**: Users can drag the window by the navbar empty space; interactive elements don't trigger drag

**Independent Test**: Drag empty area of navbar → window moves. Click a tab → navigates (no drag).

### Implementation for User Story 7

- [ ] T018 [US7] Apply `-webkit-app-region: drag` to Navbar container and `-webkit-app-region: no-drag` to all interactive children (tabs, buttons) in `src/renderer/src/components/navigation/Navbar.tsx`
- [ ] T019 [US7] Ensure WindowControls from F001 are embedded in Navbar with no-drag region in `src/renderer/src/components/navigation/Navbar.tsx`

**Checkpoint**: Window draggable from navbar empty space. Tabs and buttons clickable without triggering drag.

---

## Phase 6: User Story 4 - Sidebar Navigation Mode (Priority: P2)

**Goal**: Users can switch to a left icon sidebar with tooltips and active route indicator

**Independent Test**: Switch navbarPosition to "left" → sidebar appears with icons → click icon → page navigates → hover → tooltip shows → switch back to "top" → tab bar returns

### Implementation for User Story 4

- [ ] T020 [US4] Create `AppLayout.tsx` with flex-row structure (Sidebar + Content column) in `src/renderer/src/components/layout/AppLayout.tsx`
- [ ] T021 [US4] Create `Sidebar.tsx` with icon list from route registry, full-height, drag region on empty space in `src/renderer/src/components/navigation/Sidebar.tsx`
- [ ] T022 [P] [US4] Create `SidebarItem.tsx` with lucide-react icon, shadcn/ui Tooltip on hover, active route indicator in `src/renderer/src/components/navigation/SidebarItem.tsx`
- [ ] T023 [US4] Create `NavbarWrapper.tsx` that reads navbarPosition from config and renders TabBar (top) or hides it (left mode) in `src/renderer/src/components/navigation/NavbarWrapper.tsx`
- [ ] T024 [US4] Update `App.tsx` to use Router + AppLayout (replace F001's placeholder root component) in `src/renderer/src/App.tsx`
- [ ] T025 [US4] Wire navbarPosition config read via IPC on app start and on config change in `src/renderer/src/stores/useTabsStore.ts`

**Checkpoint**: Both top (tab bar) and left (sidebar) modes work. Mode switch is instant without page reload.

---

## Phase 7: User Story 3 - Tab State Persistence (Priority: P2)

**Goal**: Open tabs and active tab persist across quit/relaunch

**Independent Test**: Open 3 tabs → quit → relaunch → same 3 tabs restored in same order with same active tab

### Implementation for User Story 3

- [ ] T026 [US3] Implement Zustand persist middleware with custom ConfigService IPC storage adapter in `src/renderer/src/stores/useTabsStore.ts`
- [ ] T027 [US3] Implement restoreTabs() — read openTabs + activeTabId from config on app start, hydrate store, navigate to active route in `src/renderer/src/stores/useTabsStore.ts`
- [ ] T028 [US3] Implement debounced persistTabs() — save openTabs + activeTabId to config on every tab mutation (500ms debounce) in `src/renderer/src/stores/useTabsStore.ts`
- [ ] T029 [US3] Handle corrupted/invalid persisted data — fallback to Home-only tabs with console warning in `src/renderer/src/stores/useTabsStore.ts`

**Checkpoint**: Tabs persist across app restart. Corrupted data falls back to Home tab only.

---

## Phase 8: User Story 6 - Programmatic Navigation API (Priority: P2)

**Goal**: Other features can programmatically open pages in tabs via NavigationService

**Independent Test**: Call NavigationService.navigate("/settings") → Settings tab opens (or existing activated). Call openInNewTab with custom title → tab with custom title appears.

### Implementation for User Story 6

- [ ] T030 [US6] Create `NavigationService.ts` singleton with navigate(), openInNewTab(), goBack(), getActiveRoute() in `src/renderer/src/services/NavigationService.ts`
- [ ] T031 [US6] Wire NavigationService to useTabsStore and react-router navigate function in `src/renderer/src/services/NavigationService.ts`
- [ ] T032 [US6] Handle deep link routing — register NavigationService.navigate as the deep link handler callable from F001's IPC bridge in `src/renderer/src/App.tsx`

**Checkpoint**: Programmatic navigation works. Deep links open correct tabs.

---

## Phase 9: User Story 8 - Lazy-Loaded Route Components (Priority: P2)

**Goal**: Route page components load on demand to minimize initial bundle size

**Independent Test**: Launch app → only Home page component loaded initially → navigate to Settings → Settings component loaded on demand

### Implementation for User Story 8

- [ ] T033 [US8] Convert all route component imports in Router.tsx to React.lazy() with dynamic import() in `src/renderer/src/Router.tsx`
- [ ] T034 [US8] Add React.Suspense wrapper around Routes with loading fallback component in `src/renderer/src/Router.tsx`

**Checkpoint**: Route components lazy-loaded. Initial bundle smaller. No perceivable delay on first navigation.

---

## Phase 10: User Story 5 - Tab Reordering via Drag and Drop (Priority: P3)

**Goal**: Users can drag tabs to reorder them; Home tab stays first

**Independent Test**: Open tabs [Home, A, B, C] → drag C between Home and A → order becomes [Home, C, A, B] → restart → new order preserved

### Implementation for User Story 5

- [ ] T035 [US5] Integrate @dnd-kit/sortable into TabBar — wrap tabs in SortableContext, use useSortable on TabItem in `src/renderer/src/components/navigation/TabBar.tsx`
- [ ] T036 [US5] Implement onDragEnd handler that calls reorderTabs(activeId, overId) in useTabsStore in `src/renderer/src/components/navigation/TabBar.tsx`
- [ ] T037 [US5] Ensure Home tab is excluded from sortable (non-draggable, always first) in `src/renderer/src/components/navigation/TabBar.tsx`

**Checkpoint**: Tab reordering via drag works. Home stays first. New order persists.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Tab overflow, title truncation, error boundaries, visual polish

- [ ] T038 Implement tab overflow scrolling — horizontal scroll container when tabs exceed navbar width in `src/renderer/src/components/navigation/TabBar.tsx`
- [ ] T039 [P] Implement tab title truncation with ellipsis and shadcn/ui Tooltip for full title on hover in `src/renderer/src/components/navigation/TabItem.tsx`
- [ ] T040 [P] Add ErrorBoundary wrapper per lazy-loaded route page in `src/renderer/src/Router.tsx`
- [ ] T041 [P] Add hover/active transitions for tabs and sidebar icons (Tailwind transitions) in `src/renderer/src/components/navigation/TabItem.tsx` and `SidebarItem.tsx`
- [ ] T042 Style content area with `border-top-left-radius: 10px` and subtle border for visual separation from sidebar in `src/renderer/src/components/layout/AppLayout.tsx`
- [ ] T043 Verify TypeScript strict mode — `npx tsc --noEmit` passes with zero errors
- [ ] T044 Verify build — `pnpm run build` passes with zero errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2
- **US2 (Phase 4)**: Depends on Phase 3 (needs TabItem to add close button)
- **US7 (Phase 5)**: Depends on Phase 3 (needs Navbar)
- **US4 (Phase 6)**: Depends on Phase 3 (needs TabBar for mode switching)
- **US3 (Phase 7)**: Depends on Phase 2 (needs useTabsStore)
- **US6 (Phase 8)**: Depends on Phase 2 (needs useTabsStore + Router)
- **US8 (Phase 9)**: Depends on Phase 2 (needs Router.tsx)
- **US5 (Phase 10)**: Depends on Phase 3 (needs TabBar)
- **Polish (Phase 11)**: Depends on all user stories

### Parallel Opportunities

- T002, T003 can run in parallel (different files)
- US3 (Phase 7), US6 (Phase 8), US8 (Phase 9) can start after Phase 2, parallel to US1
- T022 can run parallel within Phase 6
- T039, T040, T041 can run in parallel in Polish phase

---

## Implementation Strategy

### MVP First (User Story 1 + 2 + 7 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (router + store + placeholders)
3. Complete Phase 3: US1 (tab navigation)
4. Complete Phase 4: US2 (tab lifecycle)
5. Complete Phase 5: US7 (drag region)
6. **STOP and VALIDATE**: Basic tab-based navigation fully functional

### Incremental Delivery

1. Setup + Foundational → Router works
2. US1 + US2 + US7 → Tab navigation MVP
3. US4 → Sidebar mode
4. US3 → Tab persistence
5. US6 → Programmatic navigation
6. US8 → Lazy loading
7. US5 → Tab reordering
8. Polish → Overflow, truncation, error boundaries

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Commit after each phase checkpoint
- Total tasks: 44
- Parallel tasks: 9
