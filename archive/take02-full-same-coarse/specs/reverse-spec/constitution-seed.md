# Cherry Studio Constitution (Seed)

**Source**: /Users/coolhero/Study/oss/cherry-studio
**Generated**: 2026-03-02
**Strategy**: Stack: Same

> This document is a constitution draft extracted from existing source code analysis.
> Use this document as input when running /speckit.constitution to finalize the constitution.
> Review the draft content and modify/supplement it as needed for the redevelopment project.

---

## Source Code Reference Principles

### [Same Stack Strategy] Source as Implementation Reference

- **Original source location**: /Users/coolhero/Study/oss/cherry-studio
- When writing spec/plan for each Feature, **always** read and reference the original files specified in the Source Reference section of `pre-context.md`
- **Prioritize reusing** existing implementation patterns (design patterns, error handling, test structure)
- If designing differently from the existing implementation, **always** document the reason for the change in `plan.md`'s Complexity Tracking
- Reference existing code's test cases to ensure equivalent test coverage

---

## Extracted Architecture Principles

> Architecture patterns consistently observed in the existing code, organized as principles.

### I. Electron 3-Process Isolation
- **Rule**: All inter-process communication goes through a typed IPC channel system defined in packages/shared/IpcChannel.ts. Renderer never accesses Node.js APIs directly.
- **Rationale**: Security boundary between web content and system access
- **Evidence**: 260+ IPC channels, preload bridge in src/preload/index.ts

### II. Plugin-Based AI Pipeline
- **Rule**: AI request processing uses a composable plugin system with lifecycle hooks (configureContext, onRequestStart, transformParams, transformResult, onRequestEnd). New behaviors are added as plugins, not by modifying the core executor.
- **Rationale**: 60+ provider support requires extensible, provider-specific behavior without core modification
- **Evidence**: packages/aiCore/src/core/runtime/executor.ts, 12+ plugins in src/renderer/src/aiCore/plugins/

### III. Message Block Decomposition
- **Rule**: AI responses are decomposed into typed blocks (text, thinking, code, image, tool, citation, video, etc.). Each block has its own lifecycle and status tracking.
- **Rationale**: Complex multi-modal responses need independent rendering and state management
- **Evidence**: 11 block types in src/renderer/src/types/newMessage.ts

### IV. Monorepo Package Separation
- **Rule**: Core logic (aiCore), shared types (shared), tracing (mcp-trace), and extensions (extension-table-plus) are separate packages with explicit dependencies.
- **Rationale**: Code reuse across processes and publishability as npm packages
- **Evidence**: packages/ directory with 5 packages, pnpm-workspace.yaml

### V. Provider Abstraction Layer
- **Rule**: All AI provider interactions go through a unified provider config -> AI SDK adapter -> executor pipeline. Provider-specific logic is encapsulated in config files and plugins, not scattered in business logic.
- **Rationale**: Adding a new provider requires only a config entry and optional plugin, not modifying chat code
- **Evidence**: src/renderer/src/aiCore/provider/config/, src/renderer/src/config/providers.ts

### VI. Redux Toolkit State Management with Persistence
- **Rule**: All UI state managed via Redux Toolkit slices with selective persistence via redux-persist. Runtime-only state (tabs, toolPermissions) blacklisted from persistence.
- **Rationale**: Consistent state management with crash recovery
- **Evidence**: 28 Redux slices in src/renderer/src/store/, persist blacklist in store/index.ts

---

## Extracted Technical Constraints

| Area | Constraint | Source |
|------|-----------|--------|
| Runtime | Electron 40.6.1 + Node.js >=24.11.1 | package.json |
| Cross-platform | Windows (x64/arm64), macOS (x64/arm64), Linux (x64/arm64) | electron-builder.yml |
| Database | Dexie (IndexedDB) in renderer, LibSQL in main process | src/renderer/src/databases/, src/main/services/agents/ |
| Build | electron-vite with rolldown-vite backend | electron.vite.config.ts |
| Multiple windows | 5 renderer entry points (main, mini, selectionToolbar, selectionAction, traceWindow) | electron.vite.config.ts |
| Package format | pnpm monorepo with 5 internal packages | pnpm-workspace.yaml |

---

## Extracted Coding Conventions

| Area | Convention | Example |
|------|-----------|---------|
| Naming | camelCase variables, PascalCase types/classes/components, UPPER_CASE constants | Throughout codebase |
| Project Structure | Process-based: src/main/, src/preload/, src/renderer/ + feature-based pages | src/ directory |
| Error Handling | Chunk-level error handling with status transitions, block-level error blocks | src/renderer/src/services/messageStreaming/ |
| Logging | Winston with daily rotation (main), console-based with module filtering (renderer) | packages/shared/config/logger.ts |
| Testing | Vitest with 5 project configs (main, renderer, aiCore, shared, scripts) + Playwright E2E | vitest.config.ts |
| Formatting | Biome (2-space, LF, 120-char, single quotes, no semicolons) | biome.jsonc |
| Linting | OxLint + ESLint with import sorting, unused imports | eslint.config.mjs, .oxlintrc.json |
| i18n | i18next with 3 locale files + auto-translation scripts | src/renderer/src/i18n/ |

---

## Project-Specific Recommended Principles

> Principles recommended based on characteristics observed in the existing source code.
> These are suggestions derived from the project's domain, architecture patterns, and technical traits.
> Review and adopt/modify as appropriate for the redevelopment project.

### 1. Multi-Provider Resilience
- **Observed Trait**: 60+ AI provider integrations with varied API formats (OpenAI, Anthropic, Gemini, custom)
- **Recommended Rule**: All provider-specific logic must be isolated in config/plugin layers. Core chat logic must be provider-agnostic. Provider failures must not crash the app.
- **Rationale**: Provider APIs change frequently; isolation enables rapid adaptation

### 2. Streaming-First Architecture
- **Observed Trait**: All chat responses use streaming with chunk-based processing and block status tracking
- **Recommended Rule**: All AI interactions must support streaming from day 1. Design data models and UI around incremental updates, not request-response.
- **Rationale**: User experience with LLMs depends on perceived responsiveness

### 3. IPC Channel Contract Testing
- **Observed Trait**: 260+ IPC channels defined in a centralized enum with typed handlers
- **Recommended Rule**: Every IPC channel must have a typed contract (parameter and return types). Changes to IPC contracts must be verified against both main and renderer consumers.
- **Rationale**: IPC is the critical boundary between processes; type mismatches cause silent failures

### 4. Offline-First Data Strategy
- **Observed Trait**: All data stored locally (IndexedDB + SQLite), cloud sync is optional backup
- **Recommended Rule**: The app must function fully offline. Cloud services (AI providers, sync) are enhancements, not requirements for core operation.
- **Rationale**: Desktop app users expect data locality and offline access

### 5. Graceful Degradation for External Services
- **Observed Trait**: Multiple fallback paths (modern SDK -> legacy, vector search -> text search, multiple preprocessing providers)
- **Recommended Rule**: All external service integrations must have explicit failure handling with user-visible feedback. Critical paths must have fallback mechanisms.
- **Rationale**: AI services, cloud storage, and search providers have varied reliability

---

## Recommended Development Principles (Best Practices)

> Standard principles for redevelopment. Modify/supplement as needed for your project.

### I. Test-First (NON-NEGOTIABLE)
- Write tests before implementing any feature
- Acceptance Scenarios (Given/When/Then) from spec.md are the source of test cases
- In tasks.md, test tasks must always precede implementation tasks
- Code without tests is not considered complete
- For bug fixes: write a test that reproduces the bug first, then fix it
- **Verification criterion**: `All tests must pass upon implement completion`

### II. Think Before Coding
- Do not assume. If unclear, mark it as `[NEEDS CLARIFICATION]` in the spec
- If multiple implementation approaches are possible, document alternatives and selection rationale in plan.md's Complexity Tracking
- Expose trade-offs explicitly rather than hiding them
- **Verification criterion**: `Every design decision must have an answer to "why?"`

### III. Simplicity First
- Implement only what is specified in the spec. No speculative feature additions
- No premature abstraction for single-use code
- No abstractions/wrappers/utilities justified by "might need it later"
- If something done in 200 lines can be done in 50, rewrite it
- **Verification criterion**: `All code must be directly traceable to a spec requirement`

### IV. Surgical Changes
- No "improving" adjacent code/comments/formatting when modifying existing code
- Do not refactor what already works
- Only clean up imports/variables/functions that became unused due to your changes
- Respect existing code style and maintain consistency
- **Verification criterion**: `Every changed line must be directly traceable to the current task`

### V. Goal-Driven Execution
- Every task includes verifiable completion criteria
- Set completion criteria as "tests pass" instead of "implemented"
- For multi-step work, define verification methods for each step in advance
- **Verification criterion**: `Automated verification (tests, build, lint) must pass upon each task completion`

### VI. Demo-Ready Delivery
- Each Feature must be demonstrable upon completion -- not just passing tests, but runnable and visually/functionally verifiable
- spec-kit generates `quickstart.md` per Feature during `/speckit.plan` (validation scenarios). When this principle is active, `quickstart.md` must also include a **Demo** section with step-by-step instructions for launching and interacting with the Feature
- Maintain a centralized `demos/` directory at the project root that aggregates per-Feature demo entry points:
  ```
  demos/
  ├── README.md              # Demo Hub -- index of all Feature demos with status
  ├── F001-auth.md           # Links to quickstart.md + demo-specific setup/instructions
  ├── F002-product.md
  └── ...
  ```
- Each `demos/F00N-name.md` must contain: Prerequisites, Setup commands, Demo walkthrough (step-by-step), Expected results, and a link back to `specs/{NNN-feature}/quickstart.md` for detailed validation scenarios
- "Demo-ready" means: the Feature can be started, exercised through its core user flows, and the results observed -- without requiring other incomplete Features
- If the Feature has no UI, **implement a minimal demo surface** (CLI command, simple demo page, API playground, or script) that exercises the core functionality and displays results. "Tests only" is NOT demo-ready
- **Minimal demo surface examples by Feature type**:
  - Backend logic without UI -> CLI command or demo script that invokes the logic and prints results
  - API endpoints -> Simple API test page or curl-based demo script
  - Data layer / Store -> CLI or minimal UI that performs CRUD and displays state changes
  - Pipeline / Engine -> Demo script that runs the pipeline with sample data and shows output
- **Demo code separation strategy**: Clearly distinguish demo-only code from production code
  - **Demo-only code** (mock data, demo scripts, temporary UI scaffolding): Place under `demos/` directory. Mark with `// @demo-only` comment. Will be removed or replaced when the real Feature is implemented
  - **Promotable code** (minimal but real implementation that future Features will extend): Place in the regular source tree. Mark with `// @demo-scaffold -- will be extended by F00N-[feature]` comment. Not deleted, but evolved
  - Each `demos/F00N-name.md` must declare which category each demo component falls into:
    ```
    ## Demo Components
    | Component | Location | Category | Fate |
    |-----------|----------|----------|------|
    | Mock provider data | demos/fixtures/providers.json | Demo-only | Remove after F002-provider UI |
    | Demo CLI runner | demos/scripts/demo-F001.ts | Demo-only | Remove after full UI |
    | Settings page shell | src/pages/settings.tsx | Promotable | Extended by F005-settings |
    ```
  - During subsequent Feature implementation, check `demos/` for demo-only components marked for removal and clean them up
- **Verification criterion**: `A non-developer stakeholder can follow demos/F00N-name.md and verify the Feature works -- "npm test passes" alone does NOT satisfy this criterion`

---

## Global Evolution Layer Operational Principles

> Include these principles in the constitution to enforce referencing the Global Evolution Layer during spec-kit progression.

### Cross-Feature Consistency
- Before running /speckit.specify for any Feature, always read `specs/reverse-spec/roadmap.md` and the Feature's `pre-context.md`
- When running /speckit.plan for any Feature, reference `specs/reverse-spec/entity-registry.md` and `specs/reverse-spec/api-registry.md` to ensure entity/API compatibility
- When defining new entities or APIs, update entity-registry.md and api-registry.md
- When cross-Feature dependencies change, update the Dependency Graph in roadmap.md

---

**Version**: 0.1.0-seed | **Generated**: 2026-03-02
