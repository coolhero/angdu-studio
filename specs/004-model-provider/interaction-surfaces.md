# F004 Model Provider — Interaction Surfaces

> Guard 6b artifact. All user-facing interaction points in the model provider system.

| # | Surface | Component | Type | Verified |
|---|---------|-----------|------|----------|
| 1 | Provider list item click | ProviderList | click → select provider, show edit panel | ✅ Code review |
| 2 | Provider enable/disable switch | ProviderList | toggle → update provider enabled state | ✅ Code review |
| 3 | Add provider button | ProviderList | click → ProviderAddDialog | ✅ Code review |
| 4 | Provider type select (add dialog) | ProviderAddDialog | select → set provider type | ✅ Code review |
| 5 | Provider name input (add dialog) | ProviderAddDialog | type → set name | ✅ Code review |
| 6 | API key input | ProviderEditPanel | type → safeStorage encrypt via IPC | ✅ Code review |
| 7 | API key visibility toggle | ProviderEditPanel | click → show/hide password | ✅ Code review |
| 8 | Endpoint URL input | ProviderEditPanel | type → update endpoint | ✅ Code review |
| 9 | Test connection button | ProviderEditPanel | click → provider:test IPC → result indicator | ✅ Code review |
| 10 | Notes textarea | ProviderEditPanel | type → persist notes | ✅ Code review |
| 11 | API options toggles | ProviderApiOptions | toggle → persist advanced flags | ✅ Code review |
| 12 | Delete provider button | ProviderEditPanel | click → AlertDialog confirm → delete | ✅ Code review |
| 13 | Model list display | ModelList | read-only list by provider | ✅ Code review |
| 14 | Model search input | ModelSearch | type → filter models | ✅ Code review |
| 15 | Custom model add button | ModelList | click → CustomModelDialog | ✅ Code review |
| 16 | Custom model name/id inputs | CustomModelDialog | type → set model name/id | ✅ Code review |

## Provides Interfaces (consumed by F005)

| Interface | Consumer | Verified |
|-----------|----------|----------|
| useProviderStore.hydrate() | App.tsx startup | ✅ |
| useProviders() selector | F005 ModelSelector, AssistantEditor | ✅ |
| useModelStore.setActiveModel() | F005 ModelSelector | ✅ |
| providerClient.chat() / abort() | F005 useChatStore | ✅ |
| ai:stream-chunk/complete/error events | F005 ChatStreamService | ✅ |
