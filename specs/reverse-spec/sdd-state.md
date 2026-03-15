# SDD State

**Project**: Angdu Studio
**Origin**: rebuild
**Domain Profile**: desktop-app
**Interfaces**: gui
**Concerns**: async-state, ipc
**Archetype**: ai-assistant
**Scenario**: rebuild
**Custom**: none
**Source Path**: /Users/coolhero/Develop/cherry-studio
**Clarity Index**: N/A
**CI Dimensions**: N/A
**CI Low-confidence**: N/A
**Scope**: core
**Active Tiers**: T1
**Created**: 2026-03-15
**Last Updated**: 2026-03-15
**Constitution Version**: 1.0.0
**State Schema Version**: 2.0
**Framework**: electron

---

## Rebuild Configuration

| Parameter | Value |
|-----------|-------|
| change_scope | stack |
| preservation_level | functional |
| source_available | code-only |
| migration_strategy | big-bang |

---

### Foundation Decisions

**Framework**: electron

#### Decided
| ID | Item | Decision | Date |

#### Deferred
| ID | Item | Reason |

#### T0 Features
| Feature ID | Foundation Category | Status |

---

## Feature Progress

| ID | Feature | Tier | RG | specify | plan | tasks | analyze | implement | verify | Status |
|----|---------|------|----|---------|------|-------|---------|-----------|--------|--------|
| F001 | Electron Shell | T1 | RG-1 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | pending |
| F002 | Navigation & Layout | T1 | RG-2 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | pending |
| F003 | Theme & Appearance | T1 | RG-2 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | pending |
| F004 | Provider Management | T1 | RG-3 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | pending |
| F005 | Model Management | T1 | RG-3 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | pending |
| F006 | Chat Core | T1 | RG-3 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | pending |
| F007 | Settings System | T1 | RG-2 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | pending |
| F008 | Data & Storage | T1 | RG-1 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | pending |
| F009 | i18n | T1 | RG-1 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | pending |
| F010 | Chat Advanced | T2 | RG-4 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | deferred |
| F011 | Knowledge Base | T2 | RG-4 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | deferred |
| F012 | MCP Integration | T2 | RG-4 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | deferred |

---

## Feature Mapping

| ID | Feature | Directory | Dependencies |
|----|---------|-----------|-------------|
| F001 | Electron Shell | specs/001-electron-shell | F008 |
| F002 | Navigation & Layout | specs/002-navigation-layout | F001, F009 |
| F003 | Theme & Appearance | specs/003-theme-appearance | F001, F009 |
| F004 | Provider Management | specs/004-provider-management | F007 |
| F005 | Model Management | specs/005-model-management | F004 |
| F006 | Chat Core | specs/006-chat-core | F005, F008 |
| F007 | Settings System | specs/007-settings-system | F002, F003, F008, F009 |
| F008 | Data & Storage | specs/008-data-storage | (none) |
| F009 | i18n | specs/009-i18n | (none) |
| F010 | Chat Advanced | specs/010-chat-advanced | F006 |
| F011 | Knowledge Base | specs/011-knowledge-base | F005 |
| F012 | MCP Integration | specs/012-mcp-integration | F006 |

---

## Demo Group Progress

| Group | Scenario | Features | Status |
|-------|----------|----------|--------|
| DG-01 | First Chat | F001, F002, F003, F004, F005, F006, F008, F009 | pending |
| DG-02 | Provider Setup | F001, F004, F005, F007, F008 | pending |
| DG-03 | Knowledge-Assisted Chat | F006, F008, F011 | pending |

---

## Toolchain

| Tool | Status | Command |
|------|--------|---------|
| Build | pending | — |
| Test | pending | — |
| Lint | pending | — |
