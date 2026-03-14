# Spec-Kit Usage Prompt: Angdu Studio

## Project Identity

- **PROJECT_NAME**: Angdu Studio
- **Scope**: Core (Tier 1: 6 Features, Tier 2: 4 Features, Tier 3: 4 Features)
- **Stack**: Electron + React + Tailwind CSS 4 / shadcn/ui + Zustand + Drizzle ORM + Vercel AI SDK
- **Total Features**: 14

---

## Per-Command Context Guide

### /speckit.specify

1. Read `specs/reverse-spec/pre-context.md` -> **"For /speckit.specify"** section
2. Reference `specs/reverse-spec/business-logic-map.md` for business rules and domain logic
3. Check `specs/entity-registry.md` for shared entities to avoid duplication
4. Output: Feature specification with screens, entities, rules, and acceptance criteria

### /speckit.plan

1. Read `specs/reverse-spec/pre-context.md` -> **"For /speckit.plan"** section
2. Reference `specs/reverse-spec/stack-migration.md` for migration impact on this feature
3. Check `specs/entity-registry.md` for shared entities already defined
4. Check `specs/api-registry.md` for IPC/API contracts already defined
5. Output: Implementation plan with phases, dependencies, and migration steps

### /speckit.implement

1. Reference `specs/reverse-spec/constitution-seed.md` for coding principles and conventions
2. Read `specs/reverse-spec/pre-context.md` -> **Source Reference** section for original Cherry Studio files
3. Follow stack conventions: Tailwind + shadcn/ui for UI, Zustand for state, Drizzle for DB
4. Output: Working code for the planned phase

### /speckit.verify

1. Check `specs/coverage-baseline.md` for intentional exclusions (do not flag these as missing)
2. Run verification gates in order:
   - **Test gate**: `npm run test` (Vitest unit/integration)
   - **Build gate**: `npm run build` (electron-vite production build)
   - **Lint gate**: `npm run lint` (ESLint + Prettier)
3. Output: Verification report with pass/fail per gate + coverage delta

---

## Cross-Feature Awareness Protocol

### Before Starting a Feature

1. Read all preceding Features' `pre-context.md` files for dependency context
2. Check `specs/entity-registry.md` for entities this Feature depends on
3. Check `specs/api-registry.md` for IPC channels this Feature depends on

### After Completing a Feature

1. Update `specs/entity-registry.md` with any new entities introduced
2. Update `specs/api-registry.md` with any new IPC channels or API contracts
3. Check Demo Group progress -- when all Features in a group are verified, the demo is ready

---

## Feature Catalog

| ID | Feature | Tier | Demo Group | Dependencies |
|----|---------|------|------------|--------------|
| F001 | app-shell | 1 | D1-Core | None |
| F002 | settings | 1 | D1-Core | F001 |
| F003 | provider | 1 | D1-Core | F001, F002 |
| F004 | ai-core | 1 | D1-Core | F003 |
| F005 | assistant | 1 | D1-Core | F004 |
| F006 | chat | 1 | D1-Core | F004, F005 |
| F007 | knowledge | 2 | D2-Enhance | F004, F006 |
| F008 | mcp | 2 | D2-Enhance | F004, F006 |
| F009 | web-search | 2 | D2-Enhance | F004, F006 |
| F010 | backup-sync | 2 | D2-Enhance | F002 |
| F011 | notes | 3 | D3-Extras | F001 |
| F012 | translate | 3 | D3-Extras | F004 |
| F013 | agent | 3 | D3-Extras | F004, F005 |
| F014 | extras | 3 | D3-Extras | F001, F002 |

### Tier Definitions

- **Tier 1 (Core)**: Essential for MVP. Must be implemented first. F001-F006.
- **Tier 2 (Enhance)**: Adds significant value. Implement after Tier 1 is stable. F007-F010.
- **Tier 3 (Extras)**: Nice-to-have features. Implement last. F011-F014.

### Demo Groups

- **D1-Core**: F001-F006 -- Basic AI chat with configurable providers and assistants
- **D2-Enhance**: F007-F010 -- Knowledge base, MCP tools, web search, backup/sync
- **D3-Extras**: F011-F014 -- Notes, translation, agent API, miscellaneous utilities

---

## Registry Files

| File | Purpose | Updated By |
|------|---------|------------|
| `specs/entity-registry.md` | Shared entity definitions (types, schemas) | /speckit.specify, /speckit.implement |
| `specs/api-registry.md` | IPC channel contracts and API surfaces | /speckit.plan, /speckit.implement |
| `specs/coverage-baseline.md` | Intentional test exclusions with rationale | /speckit.verify |

---

## Naming Conventions

| Context | Cherry Studio | Angdu Studio |
|---------|--------------|--------------|
| Logger prefix | CSLOGGER | ASLOGGER |
| App name | Cherry Studio | Angdu Studio |
| Package name | cherry-studio | angdu-studio |
| IPC prefix | cs: | as: |
