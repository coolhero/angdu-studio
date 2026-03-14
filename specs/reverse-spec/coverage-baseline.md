# Source Coverage Baseline

**Source**: /Users/coolhero/Develop/cherry-studio
**Generated**: 2026-03-14
**Scope**: Core (12 Features, Tiers 1/2/3)

---

## Surface Metrics

| Metric | Source | Mapped | Coverage |
|--------|--------|--------|----------|
| Source files | ~1,494 | ~850 (key files) | 56.9% |
| Entities | 28 | 21 | 75.0% |
| IPC channels | 432 | 432 | 100% |
| REST API endpoints | 21 | 21 | 100% |
| Source behaviors (SBI) | 397 | 397 | 100% |
| Business rules | 20 | 20 | 100% |
| Test files | 267 | — | (not tracked) |

> **Note**: Source file coverage is lower than 100% because many files are implementation details (internal helpers, type re-exports, index files, build scripts, migration code) that are captured by SBI entries rather than individually listed. The 397 SBI entries comprehensively cover exported behaviors across all Feature source files.

---

## Per-Feature Coverage

| Feature | SBI Range | SBI Count | Key Source Files |
|---------|-----------|-----------|------------------|
| F001-shell | B001–B045 | 45 | src/main/index.ts, services/WindowService.ts, ipc.ts, preload/ |
| F002-i18n-theme | B046–B070 | 25 | src/renderer/src/i18n/, assets/styles/ |
| F003-providers | B071–B110 | 40 | packages/aiCore/, ai-sdk-provider/, config/models/ |
| F004-assistants | B111–B138 | 28 | store/assistants.ts, services/AssistantService.ts |
| F005-chat | B139–B178 | 40 | pages/home/, store/newMessage.ts, services/MessagesService.ts |
| F006-settings | B179–B220 | 42 | pages/settings/, store/settings.ts |
| F007-knowledge | B221–B246 | 26 | main/knowledge/, services/KnowledgeService.ts |
| F008-mcp | B247–B279 | 33 | services/MCPService.ts, main/mcpServers/ |
| F009-notes | B280–B311 | 32 | pages/notes/, services/NotesService.ts |
| F010-files | B312–B333 | 22 | services/FileStorage.ts, services/FileManager.ts |
| F011-tools | B334–B365 | 32 | pages/translate/, paintings/, code/, minapps/ |
| F012-infra | B366–B397 | 32 | services/BackupManager.ts, apiServer/, SelectionService.ts |

---

## Intentional Exclusions

| Category | Items | Reason |
|----------|-------|--------|
| Build scripts | scripts/*.ts (15 files) | `out-of-scope` — CI/CD tooling, not app functionality |
| Migration code | store/migrate.ts (93KB) | `covered-differently` — data migration handled by Drizzle ORM in new stack |
| Test infrastructure | tests/, __tests__/ (267 files) | `out-of-scope` — tests will be rewritten for new implementation |
| Generated code | out/, apiServer/generated/ | `third-party` — build output, auto-generated OpenAPI spec |
| docs/ | Documentation markdown files | `out-of-scope` — project documentation, not app code |
| patches/ | pnpm patches (12 files) | `out-of-scope` — library patches specific to current dependency versions |
| config files | .eslintrc, biome.jsonc, etc. | `covered-differently` — new project will have its own config |

---

## Cross-Verification

✅ Surface Metrics SBI total: 397 = SBI Numbering Verification total: 397 ✓
✅ Per-Feature ranges match SBI Verification output ✓
