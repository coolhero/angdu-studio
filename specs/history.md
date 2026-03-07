# Decision History

> Auto-generated during `/reverse-spec` and `/smart-sdd` execution.
> Records key strategic and architectural decisions with rationale.

---

## [2026-03-07] /reverse-spec — Project Setup

### Strategy Decisions


| Decision         | Choice                       | Rationale                               |
| ---------------- | ---------------------------- | --------------------------------------- |
| Scope            | core                         | For learning/prototyping purposes       |
| Stack            | new                          | Migrate to an optimal modern tech stack |
| Project Identity | Cherry Studio → Angdu Studio | User-specified rename                   |


### Per-Category Stack Choices (New Stack)


| Category         | Original                                  | Chosen                     | Reason                                             |
| ---------------- | ----------------------------------------- | -------------------------- | -------------------------------------------------- |
| Language         | TypeScript 5.8                            | TypeScript 5.x (Keep)      | Already optimal                                    |
| Runtime          | Electron 40.6                             | Electron (Keep)            | Mature, battle-tested                              |
| UI Framework     | React 19.2                                | React 19 (Keep)            | Already latest, best ecosystem                     |
| UI Components    | Ant Design + Styled Components + Tailwind | shadcn/ui + Tailwind CSS 4 | Modern, composable, eliminates 3-way styling split |
| State Management | Redux Toolkit + Persist                   | Zustand + persist          | Lightweight, minimal boilerplate                   |
| Client DB        | Dexie 4                                   | Dexie 4 (Keep)             | Already optimal for IndexedDB                      |
| Server DB        | Drizzle + LibSQL                          | Drizzle + LibSQL (Keep)    | Type-safe, lightweight                             |
| Rich Text Editor | TipTap 3                                  | TipTap 3 (Keep)            | Best ProseMirror integration                       |
| AI SDK           | Vercel AI SDK                             | Vercel AI SDK (Keep)       | Unified provider abstraction                       |
| Build            | electron-vite + SWC                       | electron-vite + SWC (Keep) | Cutting-edge                                       |
| Testing          | Vitest + Playwright                       | Vitest + Playwright (Keep) | Already modern                                     |
| Logging          | Winston + OTel                            | Winston + OTel (Keep)      | Production-grade                                   |
| i18n             | i18next                                   | i18next (Keep)             | Standard choice                                    |


### Architecture Decisions


| Decision            | Choice                                  | Details                                                                                                                        |
| ------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Feature Granularity | Standard (Module-level)                 | 12 Features                                                                                                                    |
| Demo Groups         | 4 groups defined                        | DG-01 Basic AI Chat, DG-02 Knowledge-Augmented Chat, DG-03 Agent Execution, DG-04 Data Portability                             |
| Tier Adjustments    | None — accepted AI recommendation as-is | T1: app-core, ai-provider, chat, editor; T2: auth, mcp, knowledge, file-management, settings-ui; T3: agent, memory, extensions |


---

## [2026-03-07] /smart-sdd pipeline — Constitution

### Constitution


| Decision             | Details        |
| -------------------- | -------------- |
| Constitution Version | 1.0.0          |
| Key Modifications    | Accepted as-is |


