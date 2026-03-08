# F008-memory — Pre-Context

> Feature: Memory System
> Ring: RG-3 | Tier: T3
> Generated: 2026-03-08

---

## 1. Runtime Exploration Results

### Screen: Settings → Memory

**Layout**: Settings panel within global settings page

**UI Elements**:
- Global memory toggle (enable/disable for all assistants)
- Per-assistant memory toggle (in assistant settings)
- User selector dropdown (multi-user memory isolation)
- Embedding model selector for memory vectors
- Embedding dimensions config (auto-detect or manual)
- Custom fact extraction prompt textarea
- Custom update memory prompt textarea
- Memory list view (per user)
- Delete user / Delete all memories buttons
- Migration button (migrate legacy memory DB)

**User Flows**:
| Flow | Steps | Observations |
|------|-------|--------------|
| Enable memory | Settings → Memory → Toggle on | Globally enables memory for all assistants |
| Add memory (auto) | Chat with assistant (memory enabled) → Facts auto-extracted | MemoryProcessor extracts facts via LLM |
| Search memories | Internal (during chat) → Similarity search on user query | Returns relevant memories to augment context |
| View memories | Settings → Memory → Select user → View list | Shows all stored memories for user |
| Delete memory | Settings → Memory → Select item → Delete | Removes from LibSQL |
| Update memory | Settings → Memory → Edit item → Save | Updates text and re-embeds |
| Switch user | Settings → Memory → User dropdown → Select | Isolates memory per user |
| Customize prompts | Settings → Memory → Edit extraction/update prompts | Customizes LLM behavior |

---

## 2. Source Reference

### Main Process (Electron)

| File | Purpose |
|------|---------|
| `src/main/services/memory/MemoryService.ts` | Core memory service: add, search, list, delete, update, user management |
| `src/main/services/memory/queries.ts` | LibSQL query templates for memory CRUD and vector search |

### Renderer (React)

| File | Purpose |
|------|---------|
| `src/renderer/src/store/memory.ts` | Redux slice: MemoryState, memoryConfig, currentUserId, globalMemoryEnabled |
| `src/renderer/src/services/MemoryService.ts` | Renderer-side memory service (IPC bridge) |
| `src/renderer/src/services/MemoryProcessor.ts` | Automatic fact extraction from chat messages, LLM-based ADD/UPDATE/DELETE |
| `src/renderer/src/utils/memory-prompts.ts` | Default prompts for fact extraction and memory update |

### Shared / Types

| File | Purpose |
|------|---------|
| `src/renderer/src/types/index.ts` | MemoryItem, MemoryConfig, MemorySearchResult, MemoryEntity interfaces |

---

## 3. Source Behavior Inventory

| ID | Behavior | Priority | Notes |
|----|----------|----------|-------|
| B156 | Add memory item with text and metadata via LLM extraction | P1 | Core memory creation |
| B157 | Search memories by semantic similarity (vector search) | P1 | Returns scored results |
| B158 | List all memories for a given user | P1 | Paginated listing |
| B159 | Delete individual memory item by ID | P1 | Removes from LibSQL |
| B160 | Update memory item text and re-embed | P1 | Updates vector |
| B161 | Get individual memory item by ID | P2 | Single item retrieval |
| B162 | Auto-extract facts from chat messages (MemoryProcessor) | P1 | LLM-based: ADD, UPDATE, DELETE operations |
| B163 | Per-user memory isolation (currentUserId) | P1 | Multi-user support |
| B164 | Delete all memories for a user | P2 | Bulk delete |
| B165 | Delete user entirely (remove user + all memories) | P2 | User management |
| B156a | Get users list | P2 | Lists all users with memories |
| B156b | Migrate legacy memory database | P3 | One-time migration |
| B156c | Configure embedding dimensions (auto or manual) | P2 | Per-config setting |
| B156d | Custom fact extraction prompt | P2 | Customizable LLM prompt |
| B156e | Custom update memory prompt | P2 | Customizable LLM prompt |

---

## 4. UI Component Features

### AntD Components Used (to migrate to shadcn/ui)

| AntD Component | Usage | shadcn/ui Target |
|----------------|-------|------------------|
| `Switch` | Global memory toggle, per-assistant toggle | `Switch` |
| `Select` | User selector, embedding model selector | `Select` |
| `InputNumber` | Embedding dimensions | `Input` (type=number) |
| `Input.TextArea` | Custom prompts | `Textarea` |
| `List` | Memory items list | Custom list |
| `Button` | Delete, save, migrate actions | `Button` |
| `Popconfirm` | Delete confirmation | `AlertDialog` |
| `message` | Success/error notifications | `toast` (sonner) |

---

## 5. Naming Remapping

| Original (Cherry) | Target (Angdu) |
|--------------------|----------------|
| `@cherry/memory` (BuiltinMCPServerNames.memory) | `@angdu/memory` |
| `IpcChannel.Memory_*` | `IpcChannel.Memory_*` (no change needed) |
| `memory_currentUserId` (localStorage key) | `memory_currentUserId` (keep or rename) |

---

## 6. Static Resources

| Resource | Path | Notes |
|----------|------|-------|
| No custom assets | — | Uses standard icons from icon library |

---

## 7. Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| Embedding provider API keys | Vector generation for memories | Yes (shared with F003-provider) |
| LLM provider API keys | Fact extraction via MemoryProcessor | Yes (shared with F003-provider) |

---

## 8. For /speckit.specify

### Summary
Memory system provides persistent, per-user fact storage with automatic extraction from chat conversations. Facts are embedded as vectors in LibSQL for semantic similarity search, allowing the assistant to recall relevant user-specific information during conversations. The system uses LLM-based processing to extract, update, and delete facts automatically.

### Key Scenarios

| SC-ID | Scenario | Behaviors |
|-------|----------|-----------|
| SC-080 | User enables memory and chats; facts auto-extracted | B156, B162 |
| SC-081 | Assistant retrieves relevant memories during conversation | B157 |
| SC-082 | User views and manages stored memories | B158, B159, B160, B161 |
| SC-083 | User switches between memory users | B163 |
| SC-084 | User deletes all memories for a user | B164, B165 |
| SC-085 | User customizes fact extraction prompt | B156d |
| SC-086 | User configures embedding dimensions | B156c |

### Draft Functional Requirements

| FR-ID | Requirement |
|-------|-------------|
| FR-080 | The system shall automatically extract facts from chat messages using an LLM |
| FR-081 | The system shall store memory items as vectors in LibSQL for semantic search |
| FR-082 | The system shall support ADD, UPDATE, and DELETE memory operations from LLM output |
| FR-083 | The system shall isolate memories per user ID |
| FR-084 | The system shall allow manual CRUD on memory items |
| FR-085 | The system shall support configurable embedding model and dimensions |
| FR-086 | The system shall support custom fact extraction and update prompts |
| FR-087 | The system shall provide a global toggle and per-assistant toggle for memory |

---

## 9. For /speckit.plan

### Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| F001-app-core | Hard | Electron shell, IPC infrastructure, data directory |
| F003-provider | Hard | Embedding and LLM providers for memory operations |
| F005-chat-ui | Soft | MemoryProcessor hooks into chat message flow |
| F007-knowledge | Soft | Shared LibSQL vector storage patterns; KnowledgeItemType includes 'memory' |
| `libsql` / `@libsql/client` | NPM | Vector storage backend |

### Contracts

| Contract | Direction | Consumers |
|----------|-----------|-----------|
| `IpcChannel.Memory_Add` | main ← renderer | MemoryProcessor (auto), Settings UI (manual) |
| `IpcChannel.Memory_Search` | main ← renderer | Chat message flow (context augmentation) |
| `IpcChannel.Memory_List` | main ← renderer | Settings memory list |
| `IpcChannel.Memory_Delete` | main ← renderer | Settings UI |
| `IpcChannel.Memory_Update` | main ← renderer | Settings UI |
| `IpcChannel.Memory_Get` | main ← renderer | Settings UI |
| `IpcChannel.Memory_SetConfig` | main ← renderer | Settings UI |
| `IpcChannel.Memory_DeleteUser` | main ← renderer | Settings UI |
| `IpcChannel.Memory_DeleteAllMemoriesForUser` | main ← renderer | Settings UI |
| `IpcChannel.Memory_GetUsersList` | main ← renderer | Settings UI |
| `IpcChannel.Memory_MigrateMemoryDb` | main ← renderer | Settings UI (one-time) |
| `MemoryItem` entity | store | Redux → Zustand migration |
| `MemoryConfig` entity | store | Redux → Zustand migration |
| `MemoryItem[]` in `ExternalToolResult.memories` | runtime | Returned to chat for display |

---

## 10. For /speckit.analyze

### Cross-Feature Verification

| Check | Features | Status |
|-------|----------|--------|
| MemoryProcessor integration in chat flow | F008 ↔ F005-chat-ui | MemoryProcessor called after assistant response |
| Memory items shown in message metadata | F008 ↔ F005-chat-ui | ExternalToolResult.memories display |
| Embedding model from provider config | F008 ↔ F003-provider | Shared ApiClient |
| LLM model for fact extraction | F008 ↔ F003-provider | MemoryProcessor uses LLM |
| Memory settings in global settings page | F008 ↔ F002-settings | Settings section |
| Per-assistant memory toggle | F008 ↔ F004-assistants | Assistant.enableMemory field |
| Memory as knowledge base item type | F008 ↔ F007-knowledge | KnowledgeItemType 'memory' |
| Redux → Zustand migration for memory store | F008 | memory.ts uses createSlice (Redux Toolkit) |
| `@cherry/memory` MCP server rename | F008 | BuiltinMCPServerNames.memory |
