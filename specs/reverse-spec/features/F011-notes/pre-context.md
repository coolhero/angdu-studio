# F011-notes Pre-Context

## Feature Identity

| Field | Value |
|-------|-------|
| ID | F011 |
| Name | notes |
| Title | Notes — TipTap Rich Editor & File Tree |
| Tier | 3 |
| Risk Group | RG-4 |
| Dependencies | F007-files, F002-i18n-theme |
| SBI Range | B177 – B195 |

## Project Context

- **Original**: Cherry Studio (`/Users/coolhero/Develop/cherry-studio`)
- **New**: Angdu Studio — Electron + React 19 + Zustand + Tailwind 4 + shadcn/ui + Vite 7
- **Naming**: Cherry -> Angdu, CS -> AS

## Key Source Files (relative to cherry-studio)

| Path | Role |
|------|------|
| `src/renderer/src/pages/notes/NotesPage.tsx` | Notes page — three-panel layout |
| `src/renderer/src/components/RichEditor/` | TipTap editor components |
| `src/renderer/src/components/CodeEditor/` | CodeMirror editor components |
| `src/renderer/src/store/note.ts` | Notes Redux slice (state management) |

## SBI Table

| ID | Source File | Function/Method | Behavior Description | Priority | Origin |
|----|-------------|----------------|---------------------|----------|--------|
| B177 | pages/notes/NotesPage.tsx | renderNotesLayout() | Renders three-panel layout (sidebar, header, editor) | P1 | extracted |
| B178 | store/note.ts | setActiveFilePath() | Sets currently active note file | P1 | extracted |
| B179 | store/note.ts | setExpandedPaths() | Updates expanded tree paths | P1 | extracted |
| B180 | store/note.ts | setStarredPaths() | Manages starred/favorite notes | P2 | extracted |
| B181 | store/note.ts | setSortType() | Changes note sorting (name/date) | P2 | extracted |
| B182 | components/RichEditor/ | initTipTapEditor() | Initializes TipTap with extensions (heading, code, image, link, list, math, mention, ToC, drag-handle) | P1 | extracted |
| B183 | components/RichEditor/ | handleSave() | Saves editor content to file | P1 | extracted |
| B184 | components/RichEditor/ | convertToMarkdown() | Converts TipTap content to markdown | P1 | extracted |
| B185 | components/RichEditor/ | convertFromMarkdown() | Parses markdown into TipTap content | P1 | extracted |
| B186 | components/RichEditor/ | renderToolbar() | Renders formatting toolbar (bold, italic, heading, code, etc.) | P1 | extracted |
| B187 | components/RichEditor/ | handleDragBlock() | Handles drag-handle for block reordering | P2 | extracted |
| B188 | components/RichEditor/ | renderTableOfContents() | Generates and renders ToC from headings | P2 | extracted |
| B189 | components/RichEditor/ | handleContentSearch() | Line-by-line content search with highlighting | P2 | extracted |
| B190 | components/CodeEditor/ | initCodeMirror() | Initializes CodeMirror with language support | P1 | extracted |
| B191 | components/CodeEditor/ | handleLanguageChange() | Switches syntax highlighting language | P2 | extracted |
| B192 | pages/notes/ | handleFileTreeDrop() | Handles dropping .md files/folders | P2 | extracted |
| B193 | pages/notes/ | handleCreateNote() | Creates new note file | P1 | extracted |
| B194 | pages/notes/ | handleDeleteNote() | Deletes note with confirmation | P1 | extracted |
| B195 | pages/notes/ | handleRenameNote() | Renames note file | P2 | extracted |

## Priority Summary

- **P1 (Must)**: 11 behaviors — layout, file path, tree expand, TipTap init, save, markdown convert (both), toolbar, CodeMirror init, create/delete note
- **P2 (Should)**: 8 behaviors — starred, sort, drag block, ToC, search, language change, file drop, rename

## Dependency Notes

- **F007-files**: File tree navigation, file I/O for note storage
- **F002-i18n-theme**: i18n strings, theme tokens for editor styling

## Migration Notes

- Redux slice (`store/note.ts`) migrates to Zustand store
- TipTap and CodeMirror are third-party libraries; verify compatible versions for React 19
- Toolbar and editor styling migrate from existing CSS to Tailwind 4 + shadcn/ui components
