# angdu-studio Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-08

## Active Technologies
- TypeScript 5.8, targeting ES2022 + Vercel AI SDK 6 (`ai`), Zustand 5.x, electron-store 10.x, Zod (provider type validation) (002-ai-provider)
- Zustand persist middleware → electron-store via IPC (renderer), electron-store direct (main) (002-ai-provider)
- TypeScript 5.8, targeting ES2022 + Zustand 5.x, Dexie 4, Vercel AI SDK 6 (`ai`), nanoid (003-chat-core)
- Dexie (IndexedDB) for messages, topics, blocks; Zustand persist for assistants (003-chat-core)
- TypeScript 5.8, targeting ES2022 + React 19, Electron 40, shadcn/ui, Tailwind CSS 4, TipTap 3, react-markdown, Shiki, KaTeX, Mermaid, @xyflow/react, @hello-pangea/dnd, react-infinite-scroll-component, react-hotkeys-hook, motion/react, Sonner, lucide-react, i18nex (005-chat-ui)
- Dexie (IndexedDB) for messages/blocks/topics (F003), electron-store for settings (via IPC), Zustand persist for UI preferences (005-chat-ui)
- TypeScript 5.8, targeting ES2022 + React 19, Electron 40, Zustand 5.x, electron-store 10.x, Dexie 4, shadcn/ui, Tailwind CSS 4, react-hook-form, zod, i18next, Sonner, lucide-react, webdav, @aws-sdk/client-s3, archiver, adm-zip (004-settings-data)
- Dexie (IndexedDB) for FileMetadata, electron-store for settings/backup/miniapps/shortcuts via IPC (004-settings-data)

- TypeScript 5.8, targeting ES2022 + Electron 40, React 19, electron-vite 3.x + SWC, Zustand 5.x, electron-store 10.x, electron-updater 6.x, electron-window-state 5.x (001-app-core)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.8, targeting ES2022: Follow standard conventions

## Recent Changes
- 004-settings-data: Added TypeScript 5.8, targeting ES2022 + React 19, Electron 40, Zustand 5.x, electron-store 10.x, Dexie 4, shadcn/ui, Tailwind CSS 4, react-hook-form, zod, i18next, Sonner, lucide-react, webdav, @aws-sdk/client-s3, archiver, adm-zip
- 005-chat-ui: Added TypeScript 5.8, targeting ES2022 + React 19, Electron 40, shadcn/ui, Tailwind CSS 4, TipTap 3, react-markdown, Shiki, KaTeX, Mermaid, @xyflow/react, @hello-pangea/dnd, react-infinite-scroll-component, react-hotkeys-hook, motion/react, Sonner, lucide-react, i18nex
- 003-chat-core: Added TypeScript 5.8, targeting ES2022 + Zustand 5.x, Dexie 4, Vercel AI SDK 6 (`ai`), nanoid


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
