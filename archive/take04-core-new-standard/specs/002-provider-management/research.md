# Research: Provider Management

**Feature**: 002-provider-management
**Date**: 2026-03-04

## Research Decisions

### R1: Provider State Management — Zustand Store vs Dexie IndexedDB

**Decision**: Zustand store with persist middleware (localStorage)

**Rationale**: Provider data is relatively small (~63 system + user providers). The existing F001 infrastructure uses Zustand + persist + broadcastSync for state management. Zustand stores provide instant reactive updates in React components. Using Dexie would add unnecessary complexity for this data volume and require an async query layer.

**Alternatives considered**:
- Dexie IndexedDB: Better for large datasets but overkill for ~100 providers. Would require async queries in every component.
- electron-store (main process): Already used for ConfigManager but not suitable for complex nested state with arrays.

### R2: OAuth Token Storage Strategy

**Decision**: Per-provider strategy matching the original implementation:
- **Copilot**: Encrypted file via Electron's `safeStorage` API
- **CherryIN**: Zustand store (persisted) for access/refresh tokens
- **Anthropic**: File-based JSON with restricted permissions (0o600)
- **VertexAI**: Zustand store for service account credentials

**Rationale**: Each OAuth provider has different security requirements. Copilot uses file-based encrypted storage because it's a long-lived token. CherryIN uses store-based storage because it has auto-refresh. Anthropic uses file-based with restricted permissions for credential persistence. VertexAI uses store-based because credentials are user-provided.

**Alternatives considered**:
- Unified encrypted storage for all: Would simplify but lose per-provider flexibility. Some tokens need file-based storage for main process access without store dependency.

### R3: Provider Type Registry — Static Config vs Database

**Decision**: Static TypeScript configuration with runtime injection

**Rationale**: The 63 system providers and 12 provider types are application constants that change only with app updates, not at runtime. Static configuration provides type safety, tree-shaking, and no loading delay. The configuration is imported directly from a config module.

**Alternatives considered**:
- Database-stored: Would allow runtime updates but adds unnecessary indirection for fixed data.
- JSON files: Would work but loses TypeScript type safety.

### R4: API Key Security — safeStorage vs Plain Text

**Decision**: Store API keys in the Zustand persisted store (localStorage). Use Electron's `safeStorage` only for OAuth tokens (Copilot).

**Rationale**: The original Cherry Studio stores API keys in the Redux persisted store (plain text in localStorage). While not ideal, this is the established pattern for desktop AI apps. Electron's safeStorage would require main process involvement for every key read, adding latency. API keys are already exposed in the browser dev tools anyway (desktop app, not web). The trade-off is acceptable for a desktop app where the user owns the machine.

**Alternatives considered**:
- safeStorage for all keys: More secure but requires IPC round-trip for every key access, breaking the direct store access pattern.
- Keychain/credential store: Platform-specific, complex to implement consistently.

### R5: Provider Connectivity Testing — Main Process IPC

**Decision**: Main process via IPC (`Provider_CheckConnectivity` channel)

**Rationale**: Connectivity testing benefits from main process execution for consistent proxy handling (using Electron's session proxy settings), avoiding CORS issues with some provider endpoints, and accessing provider credentials stored in secure locations (e.g., Copilot encrypted file). The IPC overhead is negligible for a one-shot test request.

**Alternatives considered**:
- Renderer-side HTTP: Simpler but may face CORS issues and lacks access to proxy settings and secure credentials.

### R6: Model Capability Detection — Static Mapping vs Runtime Detection

**Decision**: Hybrid approach — static capability flags on pre-configured models + runtime detection via provider-specific logic

**Rationale**: Most model capabilities are known at configuration time (e.g., GPT-4 Vision supports vision). However, some capabilities can only be determined at runtime (e.g., custom models on Ollama). The model entity stores capability flags that are either pre-set from the system model configuration or inferred from model metadata.

### R7: Dual-Endpoint Provider Pattern

**Decision**: Provider entity includes an optional `anthropicApiHost` field alongside the primary `apiHost`

**Rationale**: Many Chinese AI aggregators (Silicon, AIHubMix, Zhipu, DeepSeek, etc.) offer both OpenAI-compatible and Anthropic-compatible endpoints. When a Claude model is used through such a provider, the request should route through the Anthropic endpoint. This is an existing pattern from the original source that must be preserved.

### R8: Provider Logo Assets — Image Import vs Asset Copy

**Decision**: Copy provider/model logo images from the original source as static assets, reference via import map

**Rationale**: Provider logos are static image files (PNG/SVG) that cannot be generated. They must be copied from the original source directory and placed in the renderer's assets. A logo map (provider ID → image import) provides type-safe access.

### R9: IPC Channel Registration for OAuth Services

**Decision**: Register F002's IPC channels in a new `provider.ipc.ts` module following F001's pattern. OAuth services live in `src/main/services/` as singleton classes.

**Rationale**: F001 established the pattern of domain-specific IPC handler files in `src/main/ipc/` with registration in `index.ts`. OAuth services (Copilot, CherryIN, Anthropic, VertexAI) are main-process-only services that handle secure operations. They follow the existing service pattern from F001.
