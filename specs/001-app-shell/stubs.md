# F001 App Shell — Dependency Stubs

> Guard 6c artifact.

| # | Stub Location | Description | Depends On | Expected Resolution Feature |
|---|---------------|-------------|------------|----------------------------|
| 1 | `src/main/bootstrap.ts` Phase 4 | ProviderService.initialize() called in F001 bootstrap | F004 model-provider | Resolved — F004 implemented |
| 2 | `src/main/bootstrap.ts` Phase 5 | initializeDatabase() + AssistantService called in bootstrap | F005 chat-conversation | Resolved — F005 implemented |

Note: These are resolved stubs — F004 and F005 are implemented. The coupling is by design (bootstrap orchestrates all services). No unresolved forward stubs remain.
