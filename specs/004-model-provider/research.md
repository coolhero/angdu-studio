# Research: Model Provider

## R-001: Vercel AI SDK Multi-Provider Integration

**Decision**: Use Vercel AI SDK v4+ as the primary provider abstraction layer
**Rationale**: Provides unified streaming interface across 12+ provider types. Handles request/response normalization, streaming, and error handling. Tree-shakeable package architecture (@ai-sdk/openai, @ai-sdk/anthropic, etc.) keeps bundle size minimal per provider.
**Alternatives considered**:
- Custom adapter pattern: Higher control but significant maintenance burden for 12+ providers
- LangChain.js: Too heavy for our needs, adds unnecessary abstraction layers

## R-002: API Key Encryption Strategy

**Decision**: Use Electron `safeStorage` API for API key encryption at rest
**Rationale**: `safeStorage.encryptString()` uses platform keychain (macOS Keychain, Windows DPAPI, Linux libsecret). Keys are encrypted before writing to config store, decrypted only when needed for API calls in main process.
**Alternatives considered**:
- crypto.createCipheriv with app-derived key: Portable but key management complexity
- Plain text with file permissions: Insufficient — any process can read userData files

## R-003: Provider State Architecture

**Decision**: Two Zustand stores — `useProviderStore` (providers + CRUD) and `useModelStore` (models + cache + selection)
**Rationale**: Separation of concerns — provider configs change rarely (user setup), model lists change frequently (refresh/cache). Independent persistence strategies: providers persist immediately on change, model cache uses TTL-based invalidation.
**Alternatives considered**:
- Single unified store: Models embedded in provider objects creates performance issues when model list updates trigger provider re-renders
- Three stores (provider/model/selection): Over-segmented, selection is tightly coupled to model identity

## R-004: Main Process vs Renderer for API Calls

**Decision**: All provider API calls (connection test, model fetch, chat completion) execute in main process
**Rationale**: Main process has direct access to safeStorage for key decryption, node-fetch for proxy support, and is not subject to CORS restrictions. Renderer sends requests via IPC, receives responses/streams via IPC events.
**Alternatives considered**:
- Renderer with decrypted keys passed via IPC: Exposes keys in renderer memory, violates security model
- Hybrid (renderer for simple calls, main for auth): Inconsistent pattern, harder to audit

## R-005: Model List Caching Strategy

**Decision**: Cache model lists in Zustand persist (localStorage) with per-provider timestamp. TTL: 1 hour default, manual refresh available.
**Rationale**: Model lists change infrequently (new models added monthly). Local cache enables offline browsing. Per-provider timestamps allow selective refresh. Zustand persist avoids separate DB table.
**Alternatives considered**:
- SQLite table per provider: Overkill for read-heavy, rarely-written data
- No caching (always fetch): Poor offline experience, unnecessary API calls

## R-006: System Provider Definition Strategy

**Decision**: Define system providers as a static TypeScript registry in `@shared/providers/system-providers.ts`. Each entry contains: id, type, name, defaultApiHost, logo path, models (optional static list).
**Rationale**: System providers are code-level constants, not user data. Static definition enables tree-shaking unused providers, type-safe access, and zero runtime cost. User adds apiKey to activate.
**Alternatives considered**:
- Database seeding on first launch: Slower startup, migration complexity for provider updates
- Remote provider registry: Requires network on first launch, version sync complexity
