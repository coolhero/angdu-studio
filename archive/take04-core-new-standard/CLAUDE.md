# angdu-studio Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-04

## Active Technologies
- TypeScript 5.8 + Zustand (state), Zod (validation), electron-vite 5, React 19 (002-provider-management)
- Zustand persist (localStorage) for providers/models, safeStorage (Copilot token), file-based (Anthropic credentials) (002-provider-management)
- TypeScript 5.8 + React 19, Zustand (state), Dexie 4 (persistence), AI SDK v6 via F003 (streaming), shadcn/ui + Radix (UI), Tailwind CSS 4 (styling), TanStack Router (navigation) (005-ai-chat)
- Dexie IndexedDB (messages, blocks, topics, assistants, quick phrases) (005-ai-chat)

- TypeScript 5.8, Node.js (Electron 40 / Chromium) + Electron 40, React 19, electron-vite 5, Zustand, TanStack Router, shadcn/ui + Radix UI, Tailwind CSS 4, i18next + react-i18next, dayjs, electron-store, Dexie 4, Winston, chokidar, Zod (001-core-platform)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.8, Node.js (Electron 40 / Chromium): Follow standard conventions

## Recent Changes
- 005-ai-chat: Added TypeScript 5.8 + React 19, Zustand (state), Dexie 4 (persistence), AI SDK v6 via F003 (streaming), shadcn/ui + Radix (UI), Tailwind CSS 4 (styling), TanStack Router (navigation)
- 002-provider-management: Added TypeScript 5.8 + Zustand (state), Zod (validation), electron-vite 5, React 19

- 001-core-platform: Added TypeScript 5.8, Node.js (Electron 40 / Chromium) + Electron 40, React 19, electron-vite 5, Zustand, TanStack Router, shadcn/ui + Radix UI, Tailwind CSS 4, i18next + react-i18next, dayjs, electron-store, Dexie 4, Winston, chokidar, Zod

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
