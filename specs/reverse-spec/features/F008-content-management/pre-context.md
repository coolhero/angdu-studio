# F008 - content-management: Pre-Context

> Notes, files, paintings (image generation), translate, history
> Tier 2, RG-5 | Dependencies: F001, F002, F004

---

## 1. Runtime Exploration Results

| Observation | Detail |
|---|---|
| Notes system | Full note editor with tree structure (folders + files), drag-and-drop, file upload, full-text search |
| Notes storage | File-system based (resolveNotesPath), not in DB |
| Notes tree | NotesTreeService manages hierarchical tree: addDir, addNote, delNode, renameNode |
| Notes search | NotesSearchService provides full-text search across notes |
| Files management | FileManager handles file upload, storage, deletion with metadata |
| Image storage | ImageStorage manages generated/uploaded images |
| Paintings | Image generation UI with multiple providers (Aihubmix, Dmxapi, NewApi, Ovms, Ppio, Silicon, TokenFlux, Zhipu) |
| Paintings UI | Artboard, DynamicFormRender for provider-specific params, ImageUploader, PaintingsList |
| Translate | TranslateService with history (Dexie DB), custom languages, bidirectional translation |
| History | Chat history browser with search (SearchMessage, SearchResults, TopicMessages, TopicsHistory) |
| Database (Dexie) | translate_history, files, knowledge_notes tables in IndexedDB |
| Notes state | Redux store (note.ts) for notes state management |

## 2. Source Reference

| File Path (Cherry Studio) | Role | Rebuild Target |
|---|---|---|
| src/renderer/src/pages/notes/NotesPage.tsx | Notes main page layout | [TBD] |
| src/renderer/src/pages/notes/NotesEditor.tsx | Rich text note editor | [TBD] |
| src/renderer/src/pages/notes/NotesSidebar.tsx | Notes tree sidebar | [TBD] |
| src/renderer/src/pages/notes/NotesSidebarHeader.tsx | Sidebar header with actions | [TBD] |
| src/renderer/src/pages/notes/NotesSettings.tsx | Notes settings | [TBD] |
| src/renderer/src/pages/notes/HeaderNavbar.tsx | Notes header navigation | [TBD] |
| src/renderer/src/pages/notes/MenuConfig.tsx | Notes context menu config | [TBD] |
| src/renderer/src/pages/notes/components/TreeNode.tsx | Tree node component | [TBD] |
| src/renderer/src/pages/notes/context/ | Notes context providers | [TBD] |
| src/renderer/src/pages/notes/hooks/useFullTextSearch.ts | Full-text search hook | [TBD] |
| src/renderer/src/pages/notes/hooks/useNotesDragAndDrop.ts | Drag-and-drop hook | [TBD] |
| src/renderer/src/pages/notes/hooks/useNotesEditing.ts | Editor state hook | [TBD] |
| src/renderer/src/pages/notes/hooks/useNotesFileUpload.ts | File upload in notes | [TBD] |
| src/renderer/src/pages/notes/hooks/useNotesMenu.tsx | Context menu hook | [TBD] |
| src/renderer/src/pages/files/FilesPage.tsx | Files main page | [TBD] |
| src/renderer/src/pages/files/ContentView.tsx | File content viewer | [TBD] |
| src/renderer/src/pages/files/FileItem.tsx | Individual file item | [TBD] |
| src/renderer/src/pages/files/FileList.tsx | File list component | [TBD] |
| src/renderer/src/pages/paintings/PaintingsRoutePage.tsx | Paintings route page | [TBD] |
| src/renderer/src/pages/paintings/AihubmixPage.tsx | Aihubmix provider page | [TBD] |
| src/renderer/src/pages/paintings/DmxapiPage.tsx | Dmxapi provider page | [TBD] |
| src/renderer/src/pages/paintings/NewApiPage.tsx | NewApi provider page | [TBD] |
| src/renderer/src/pages/paintings/OvmsPage.tsx | OVMS provider page | [TBD] |
| src/renderer/src/pages/paintings/PpioPage.tsx | PPIO provider page | [TBD] |
| src/renderer/src/pages/paintings/SiliconPage.tsx | Silicon provider page | [TBD] |
| src/renderer/src/pages/paintings/TokenFluxPage.tsx | TokenFlux provider page | [TBD] |
| src/renderer/src/pages/paintings/ZhipuPage.tsx | Zhipu provider page | [TBD] |
| src/renderer/src/pages/paintings/components/Artboard.tsx | Image canvas/preview | [TBD] |
| src/renderer/src/pages/paintings/components/DynamicFormRender.tsx | Dynamic form for provider params | [TBD] |
| src/renderer/src/pages/paintings/components/ImageUploader.tsx | Image upload component | [TBD] |
| src/renderer/src/pages/paintings/components/PaintingsList.tsx | Generated images list | [TBD] |
| src/renderer/src/pages/paintings/components/ProviderSelect.tsx | Painting provider selector | [TBD] |
| src/renderer/src/pages/paintings/config/ | Provider configurations | [TBD] |
| src/renderer/src/pages/paintings/utils/ | Painting utilities | [TBD] |
| src/renderer/src/pages/translate/TranslatePage.tsx | Translation main page | [TBD] |
| src/renderer/src/pages/translate/TranslateHistory.tsx | Translation history list | [TBD] |
| src/renderer/src/pages/translate/TranslateSettings.tsx | Translation settings | [TBD] |
| src/renderer/src/pages/history/HistoryPage.tsx | Chat history main page | [TBD] |
| src/renderer/src/pages/history/components/SearchMessage.tsx | Message search input | [TBD] |
| src/renderer/src/pages/history/components/SearchResults.tsx | Search results display | [TBD] |
| src/renderer/src/pages/history/components/TopicMessages.tsx | Messages for a topic | [TBD] |
| src/renderer/src/pages/history/components/TopicsHistory.tsx | Topics history list | [TBD] |
| src/renderer/src/services/NotesService.ts | Notes CRUD (loadTree, addDir, addNote, delNode, renameNode, uploadNotes) | [TBD] |
| src/renderer/src/services/NotesTreeService.ts | Tree structure management | [TBD] |
| src/renderer/src/services/NotesSearchService.ts | Full-text search for notes | [TBD] |
| src/renderer/src/services/TranslateService.ts | Translation API + history CRUD | [TBD] |
| src/renderer/src/services/FileManager.ts | File upload/storage/deletion | [TBD] |
| src/renderer/src/services/ImageStorage.ts | Image file storage | [TBD] |
| src/renderer/src/store/note.ts | Notes Redux state | [TBD] |
| src/renderer/src/hooks/useFiles.ts | Files hook | [TBD] |
| src/renderer/src/databases/index.ts | Dexie DB (translate_history, files, knowledge_notes) | [TBD] |

## 3. Source Behavior Inventory (SBI)

| ID | Behavior | Source Location |
|---|---|---|
| B231 | Notes — load tree structure from filesystem | NotesService.loadTree |
| B232 | Notes — sort tree by sort type | NotesService.sortTree |
| B233 | Notes — add directory to tree | NotesService.addDir |
| B234 | Notes — add note to tree | NotesService.addNote |
| B235 | Notes — resolve notes path (ensure directory exists) | NotesService.resolveNotesPath |
| B236 | Notes — delete node (file or directory) | NotesService.delNode |
| B237 | Notes — rename node | NotesService.renameNode |
| B238 | Notes — upload note files | NotesService.uploadNotes |
| B239 | Notes — full-text search across notes | NotesSearchService / useFullTextSearch |
| B240 | Notes — drag and drop reorder/move | useNotesDragAndDrop |
| B241 | Notes — editor state management (open, save, dirty tracking) | useNotesEditing |
| B242 | Notes — file upload within note editor | useNotesFileUpload |
| B243 | Notes — context menu (rename, delete, move) | useNotesMenu |
| B244 | Notes — tree node expand/collapse | TreeNode component |
| B245 | Notes — settings (default path, sort order) | NotesSettings |
| B246 | Files — list all managed files | FileList / useFiles |
| B247 | Files — upload file with metadata | FileManager |
| B248 | Files — delete file(s) | FileManager.deleteFiles |
| B249 | Files — view file content | ContentView |
| B250 | Files — file item display (name, size, type, date) | FileItem |
| B251 | Paintings — select image generation provider | ProviderSelect |
| B252 | Paintings — configure provider-specific parameters | DynamicFormRender |
| B253 | Paintings — generate image via provider API | Provider pages (AihubmixPage etc.) |
| B254 | Paintings — display generated image on artboard | Artboard |
| B255 | Paintings — upload reference image | ImageUploader |
| B256 | Paintings — list generated images | PaintingsList |
| B257 | Paintings — save/download generated image | ImageStorage |
| B258 | Paintings — provider-specific page routing | PaintingsRoutePage |
| B259 | Translate — translate text between languages | TranslateService.translateText |
| B260 | Translate — add custom language | TranslateService.addCustomLanguage |
| B261 | Translate — delete custom language | TranslateService.deleteCustomLanguage |
| B262 | Translate — update custom language | TranslateService.updateCustomLanguage |
| B263 | Translate — get all custom languages | TranslateService.getAllCustomLanguages |
| B264 | Translate — save translation history | TranslateService.saveTranslateHistory |
| B265 | Translate — update translation history entry | TranslateService.updateTranslateHistory |
| B266 | Translate — delete translation history entry | TranslateService.deleteHistory |
| B267 | Translate — clear all translation history | TranslateService.clearHistory |
| B268 | Translate — display translation history | TranslateHistory |
| B269 | Translate — translation settings (default languages, provider) | TranslateSettings |
| B270 | History — display chat topics history | TopicsHistory |
| B271 | History — display messages for selected topic | TopicMessages |
| B272 | History — search messages across all topics | SearchMessage |
| B273 | History — display search results with highlighting | SearchResults |
| B274 | Image storage — store generated/uploaded images | ImageStorage |
| B275 | Database — Dexie IndexedDB for translate_history, files, knowledge_notes | databases/index.ts |

## 4. UI Component Features

| Component | Feature |
|---|---|
| NotesPage | Split layout: sidebar (tree) + editor |
| NotesEditor | Rich text editor for note content |
| NotesSidebar | Hierarchical tree with folders and notes |
| NotesSidebarHeader | Actions: new note, new folder, search |
| TreeNode | Expandable tree node with context menu |
| FilesPage | File grid/list view with upload area |
| FileItem | File card with preview, name, size |
| ContentView | File content preview (text, image, PDF) |
| PaintingsRoutePage | Provider-based routing for image generation |
| Artboard | Canvas/preview for generated images |
| DynamicFormRender | Dynamic form based on provider parameter schema |
| ImageUploader | Drag-and-drop image upload |
| PaintingsList | Gallery of generated images |
| ProviderSelect | Dropdown for selecting image generation provider |
| TranslatePage | Two-panel translation input/output |
| TranslateHistory | Scrollable history list |
| TranslateSettings | Language and provider configuration |
| HistoryPage | Chat history browser |
| TopicsHistory | Chronological topic list |
| TopicMessages | Message thread for selected topic |
| SearchMessage | Search input with filters |
| SearchResults | Matching messages with context |

## 5. Interaction Behavior Inventory

| Interaction | Behavior |
|---|---|
| Create note | Click new note in sidebar header, note added to tree, editor opens |
| Create folder | Click new folder, name dialog, folder added to tree |
| Edit note | Click note in tree, content loaded in editor, auto-save on change |
| Delete note/folder | Right-click context menu → delete, confirm dialog |
| Drag note | Drag tree node to reorder or move to different folder |
| Search notes | Type in search bar, full-text results shown inline |
| Upload files | Drag files to files page or use upload button |
| Generate image | Select provider, fill params, click generate, image appears on artboard |
| Translate text | Enter text, select languages, click translate, result appears |
| Browse history | Scroll through topics, click to expand messages |
| Search history | Type query, matching messages highlighted in results |

## 6. Foundation Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Notes storage | Filesystem-based (keep) | Simple, portable, no DB dependency |
| Translation DB | Evaluate better-sqlite3 vs Dexie | New stack prefers better-sqlite3; translate history could move to main process |
| Files DB | Evaluate better-sqlite3 vs Dexie | Same consideration as translation |
| State management | Zustand (replacing Redux) | New stack decision |
| Paintings providers | Evaluate which to include in core scope | 8+ providers is extensive |
| Image generation | Keep provider abstraction pattern | Good separation of concerns |

## 7. Foundation Dependencies

| Dependency | Feature | What is needed |
|---|---|---|
| F001 (shell) | IPC for file operations | File system access from renderer |
| F002 (ui-framework) | UI components | Layout, forms, editor components |
| F004 (provider-engine) | Translation and image generation API | Provider access for translate and paintings |

## 8. Naming Remapping

| Cherry Studio | Angdu Studio |
|---|---|
| CherryStudio notes paths | AngduStudio notes paths |
| cherry-studio file storage paths | angdu-studio file storage paths |
| CS-specific provider references | AS-specific provider references |

## 9. Static Resources

| Resource | Location | Notes |
|---|---|---|
| Notes directory | Configurable path (default: {userData}/notes/) | User's note files |
| Files storage | {userData}/files/ | Uploaded/managed files |
| Image storage | {userData}/images/ | Generated/uploaded images |
| Paintings config | src/renderer/src/pages/paintings/config/ | Provider parameter schemas |

## 10. Environment Variables

| Variable | Purpose | Notes |
|---|---|---|
| (none specific to F008) | Paths derived from app data path | Uses standard Electron userData path |

## 11. Feature Contracts

### Provided Contracts (F008 provides to others)

| Contract | Consumer | Description |
|---|---|---|
| Notes content API | F006 (knowledge-memory) | Notes can be added as knowledge base items |
| File management API | F005 (chat-core) | File attachments in chat messages |
| Image storage API | F005 (chat-core) | Store and retrieve generated images |

### Required Contracts (F008 requires from others)

| Contract | Provider | Description |
|---|---|---|
| IPC/file system access | F001 (shell) | Read/write notes and files on disk |
| UI components | F002 (ui-framework) | Layout, forms, editor, tree components |
| Provider API | F004 (provider-engine) | Translation API and image generation API calls |

## 12. For /speckit.specify

- Notes must support hierarchical tree (folders + files) with drag-and-drop
- Notes editor must support rich text (evaluate editor library: TipTap, ProseMirror, etc.)
- Full-text search across notes must be fast (consider search indexing approach)
- File management must track metadata (name, size, type, dates)
- Paintings must support pluggable provider pattern for image generation
- Translation must support custom languages and persistent history
- Chat history must support full-text search across all topics/messages
- Dexie tables (translate_history, files, knowledge_notes) may migrate to better-sqlite3

## 13. For /speckit.plan

- Phase 1: File management service (FileManager, ImageStorage)
- Phase 2: Notes service (tree CRUD, file operations)
- Phase 3: Notes UI (sidebar, tree, editor)
- Phase 4: Translation service + UI
- Phase 5: Chat history UI (depends on F005 chat data)
- Phase 6: Paintings provider abstraction + first provider
- Phase 7: Paintings UI (Artboard, DynamicFormRender)
- Phase 8: Zustand stores for notes state
- Phase 9: Database migration (Dexie → better-sqlite3 if decided)

## 14. For /speckit.analyze

- Notes system is filesystem-based — simple but may need indexing for search performance at scale
- 8 painting providers (Aihubmix, Dmxapi, NewApi, Ovms, Ppio, Silicon, TokenFlux, Zhipu) — many are China-specific; evaluate which are core scope
- Translation uses Dexie (IndexedDB) for history — consider migrating to better-sqlite3 in main process for consistency
- Notes hooks (5 hooks) contain significant logic — good candidates for Zustand store actions
- History feature has tight coupling with chat data (F005) — coordinate contracts
- DynamicFormRender for paintings is a powerful pattern — provider-specific params rendered from config
- FileManager is used by both notes and knowledge features — shared utility
- Context providers in notes (src/renderer/src/pages/notes/context/) should map to Zustand stores
