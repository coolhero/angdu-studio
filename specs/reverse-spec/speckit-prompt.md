# Spec-Kit Prompt — Angdu Studio

> Standalone prompt for driving Angdu Studio development using spec-kit commands
> without the smart-sdd orchestration layer.

## Project Identity

| Field | Value |
|-------|-------|
| **Project** | Angdu Studio |
| **Mode** | Rebuild (Core scope, New Stack) |
| **Original** | Cherry Studio (`/Users/coolhero/Develop/cherry-studio`) |
| **Target** | `/Users/coolhero/Develop/angdu-studio` |
| **Stack** | Electron + React 19 + Zustand + Tailwind CSS 4 + shadcn/ui + Vite 7 + Drizzle ORM + better-sqlite3 |
| **Features** | 14 total — 6 T1 (Essential), 4 T2 (Recommended), 4 T3 (Optional) |

---

## Feature Catalog (Quick Reference)

| ID | Name | Tier | RG | Key Dependencies |
|----|------|------|----|-----------------|
| F001 | shell | T1 | RG-1 | — |
| F002 | i18n-theme | T1 | RG-1 | F001 |
| F003 | providers | T1 | RG-2 | F001, F002 |
| F004 | settings | T1 | RG-2 | F001, F002, F003 |
| F005 | assistants | T1 | RG-3 | F003, F004 |
| F006 | chat-core | T1 | RG-3 | F005, F003, F007 |
| F007 | files | T2 | RG-2 | F001, F002 |
| F008 | mcp | T2 | RG-3 | F003, F001 |
| F009 | agents | T2 | RG-4 | F006, F008, F003 |
| F010 | knowledge | T2 | RG-4 | F006, F007 |
| F011 | notes | T3 | RG-4 | F007, F002 |
| F012 | translate | T3 | RG-4 | F003, F002 |
| F013 | backup | T3 | RG-4 | F004, F007 |
| F014 | mini-apps | T3 | RG-4 | F001, F002 |

---

## Command Reference

### `/specify <Feature-ID>`

Generate the SDD (Software Design Document) for a single feature.

**Before running, read:**

| Artifact | Path | Why |
|----------|------|-----|
| Roadmap | `specs/reverse-spec/roadmap.md` | Dependencies, tier, RG, cross-feature entities |
| Stack Migration | `specs/reverse-spec/stack-migration.md` | Feature-specific migration notes and risks |
| Runtime Exploration | `specs/reverse-spec/runtime-exploration.md` | Original UI layout, flows, components |
| Visual References | `specs/reverse-spec/visual-references/` | Screenshots of original app screens |
| Style Tokens | `specs/reverse-spec/visual-references/style-tokens.md` | Design tokens, colors, spacing |
| History | `specs/history.md` | Prior decisions and rationale |
| Dependency SDDs | `specs/features/F0XX-*/sdd.md` | SDDs of features this one depends on |

**Output:** `specs/features/<Feature-ID>/sdd.md`

**Rules:**
1. The SDD must define all public interfaces (Zustand store shapes, IPC channels, exported hooks/components) that consuming features depend on.
2. Reference the cross-feature entity table in `roadmap.md` — if this feature owns an entity, fully define its schema. If it consumes one, reference the owner's SDD.
3. Use New Stack components exclusively. Never reference Ant Design, Styled Components, or Redux in the design.
4. Include a "Migration Notes" section summarizing what changes from the original and why.
5. Define acceptance criteria that can be verified without manual testing (unit tests, integration tests, or Playwright).

---

### `/plan <Feature-ID>`

Break the SDD into an ordered implementation plan with concrete tasks.

**Before running, read:**

| Artifact | Path | Why |
|----------|------|-----|
| Feature SDD | `specs/features/<Feature-ID>/sdd.md` | The design to implement |
| Stack Migration | `specs/reverse-spec/stack-migration.md` | Migration complexity for this feature |
| Dependency SDDs | `specs/features/F0XX-*/sdd.md` | Interface contracts to code against |
| Existing source | `src/` | What's already implemented |

**Output:** `specs/features/<Feature-ID>/plan.md`

**Rules:**
1. Each task must be completable in a single coding session (roughly 1-2 hours of focused work).
2. Tasks must be ordered so that each task's inputs exist when it starts (either from a prior task or a dependency feature).
3. First task always sets up the file/folder structure. Last task always adds tests.
4. If the feature has migration complexity Medium or higher, include an explicit "smoke test" task after the core logic to catch migration regressions early.
5. Tag each task with the files it creates or modifies.

---

### `/implement <Feature-ID> [--task N]`

Implement the feature (or a specific task from the plan).

**Before running, read:**

| Artifact | Path | Why |
|----------|------|-----|
| Feature SDD | `specs/features/<Feature-ID>/sdd.md` | Design contracts |
| Feature Plan | `specs/features/<Feature-ID>/plan.md` | Task breakdown and order |
| Stack Migration | `specs/reverse-spec/stack-migration.md` | Migration-specific guidance |
| Dependency source | `src/` (relevant dependency directories) | Actual interface implementations to code against |
| Original source | Cherry Studio source (if behavioral reference needed) | `/Users/coolhero/Develop/cherry-studio` |

**Output:** Source files in `src/`, test files in `src/**/__tests__/` or `tests/`

**Rules:**
1. Follow the plan task order exactly. Do not skip tasks.
2. After each task, run `pnpm typecheck` and `pnpm test` (if tests exist) before moving to the next.
3. Every Zustand store must use the `immer` middleware for mutation consistency.
4. Every Zustand store with persistent data must use `zustand/middleware` `persist` with an explicit `name` and `version`.
5. All UI components must use Tailwind CSS classes. Use `cn()` (clsx + tailwind-merge) for conditional styling. No inline `style={}` except for truly dynamic values (e.g., user-controlled widths).
6. shadcn/ui components should be added via `npx shadcn@latest add <component>` before first use.
7. IPC channels must follow the naming convention: `feature:action` (e.g., `shell:get-app-info`, `file:read`).
8. All public interfaces (store shapes, IPC channels, hooks) must match what the SDD specifies.
9. Commit after each completed task with message: `feat(F0XX): task N — <description>`.

---

### `/verify <Feature-ID>`

Verify that the implementation matches the SDD and passes all acceptance criteria.

**Before running, read:**

| Artifact | Path | Why |
|----------|------|-----|
| Feature SDD | `specs/features/<Feature-ID>/sdd.md` | Acceptance criteria and interface contracts |
| Feature Plan | `specs/features/<Feature-ID>/plan.md` | All tasks should be complete |
| Feature source | `src/` (feature directories) | The implementation to verify |
| Dependency SDDs | `specs/features/F0XX-*/sdd.md` | Cross-feature interface compliance |

**Output:** `specs/features/<Feature-ID>/verify-report.md`

**Rules:**
1. Run `pnpm typecheck` — must pass with zero errors.
2. Run `pnpm test` — all feature tests must pass.
3. Run `pnpm lint` — no errors (warnings acceptable).
4. Check every acceptance criterion in the SDD. Mark each as PASS/FAIL with evidence.
5. Check every public interface: does the implementation export what the SDD promises?
6. Check cross-feature contracts: do consumed interfaces match what the owner feature's SDD defines?
7. If any FAIL: list the specific fix needed. Do not auto-fix during verify — report only.

---

## Cross-Feature Awareness Rules

These rules apply to ALL commands and prevent features from making incompatible assumptions.

### Rule 1: Interface-First Development

Before implementing any feature, its dependency features' public interfaces must be either:
- Already implemented and passing verify, OR
- Defined in an SDD with enough detail to code against (types, function signatures, store shapes).

Never guess at an interface. If an upstream SDD is missing or ambiguous, run `/specify` on the dependency first.

### Rule 2: Shared Entity Ownership

The cross-feature entity table in `roadmap.md` is the source of truth for who owns what:

| Entity | Owner | Consumers |
|--------|-------|-----------|
| Window / IPC | F001-shell | All |
| Theme tokens | F002-i18n-theme | All |
| Locale strings | F002-i18n-theme | All |
| Provider config | F003-providers | F005, F006, F008, F009, F012 |
| Model definition | F003-providers | F005, F006, F009, F010, F012 |
| Settings store | F004-settings | F001, F002, F003, F006, F013 |
| Assistant | F005-assistants | F006, F009 |
| Conversation/Topic | F006-chat-core | F009, F010 |
| Message | F006-chat-core | F009, F010, F013 |
| File reference | F007-files | F006, F010, F011, F013 |
| MCP server config | F008-mcp | F009 |
| Knowledge base | F010-knowledge | F006 |

**Constraint**: Only the owner feature may define the TypeScript types, Zustand store, and database schema for its entities. Consumer features must import from the owner, never re-declare.

### Rule 3: Store Naming Convention

All Zustand stores follow the pattern:
```typescript
// File: src/stores/<feature>/<entity>.store.ts
// Hook: use<Entity>Store
// Persist key: "angdu-<feature>-<entity>"
// Example:
//   src/stores/providers/provider.store.ts
//   useProviderStore
//   persist key: "angdu-providers-provider"
```

### Rule 4: IPC Channel Registry

IPC channels must not collide across features. Each feature owns its namespace:
```
F001: shell:*     (shell:get-app-info, shell:open-external, ...)
F002: theme:*     (theme:get, theme:set, ...)
F003: provider:*  (provider:list, provider:test-connection, ...)
F004: settings:*  (settings:get, settings:set, ...)
F007: file:*      (file:read, file:write, file:list, ...)
F008: mcp:*       (mcp:list-servers, mcp:invoke-tool, ...)
F009: agent:*     (agent:create-session, agent:run, ...)
F010: knowledge:* (knowledge:search, knowledge:embed, ...)
F013: backup:*    (backup:export, backup:import, ...)
```

### Rule 5: Implementation Order

Follow the Release Group order. Within an RG, respect the dependency graph:

```
RG-1: F001-shell → F002-i18n-theme
RG-2: F007-files (parallel with F003) → F003-providers → F004-settings
RG-3: F005-assistants → F006-chat-core, F008-mcp (parallel)
RG-4: Individual features as dependencies allow
```

Never start `/implement` on a feature if its dependencies haven't passed `/verify`.

### Rule 6: Migration Reference Protocol

When implementing a feature:
1. Read the original Cherry Studio source for **behavioral reference** (what should it do).
2. Read `stack-migration.md` for **migration notes** (what changes and why).
3. Never copy-paste original code. Write fresh code using the new stack.
4. If the original has a behavior not covered by the SDD, add it to the SDD first (`/specify` update), then implement.

### Rule 7: Cross-Feature Test Isolation

Each feature's tests must be runnable independently:
- Mock dependency stores (provide test factories for Zustand stores).
- Mock IPC calls (provide a test IPC bridge).
- Never import test utilities from another feature's test directory.
- Shared test utilities go in `tests/utils/`.

---

## Workflow Summary

For each feature, in order:

```
1. /specify F0XX          → produces sdd.md
2. /plan F0XX             → produces plan.md
3. /implement F0XX        → produces source code (task by task)
4. /verify F0XX           → produces verify-report.md
```

Start with F001-shell. Proceed through the dependency graph. Every feature must pass `/verify` before its consumers can start `/implement`.

---

## Context Loading Cheat Sheet

Quick reference for which files to load into context for each command:

```
┌──────────────┬─────────────────────────────────────────────────────────┐
│ Command      │ Required Context                                       │
├──────────────┼─────────────────────────────────────────────────────────┤
│ /specify     │ roadmap.md + stack-migration.md + runtime-exploration  │
│              │ + visual-references/ + history.md + dep SDDs           │
├──────────────┼─────────────────────────────────────────────────────────┤
│ /plan        │ this feature's sdd.md + stack-migration.md             │
│              │ + dep SDDs + existing src/                             │
├──────────────┼─────────────────────────────────────────────────────────┤
│ /implement   │ this feature's sdd.md + plan.md + stack-migration.md  │
│              │ + dep source code + cherry-studio source (ref only)    │
├──────────────┼─────────────────────────────────────────────────────────┤
│ /verify      │ this feature's sdd.md + plan.md + source code         │
│              │ + dep SDDs (cross-feature contracts)                   │
└──────────────┴─────────────────────────────────────────────────────────┘
```
