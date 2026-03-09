# Quickstart: Chat UI

**Feature**: F005 - Chat UI | **Date**: 2026-03-09

## Prerequisites

- Node.js 20+, npm
- F001 (app-core), F002 (ai-provider), F003 (chat-core) implemented
- Dependencies installed: `npm install`

## New Dependencies

```bash
# shadcn/ui components (copy into src/renderer/src/components/ui/)
npx shadcn@latest add button tooltip dropdown-menu dialog alert-dialog separator collapsible accordion alert badge avatar card input textarea popover scroll-area

# Toast notifications
npm install sonner

# Markdown pipeline (most already installed from source)
npm install react-markdown remark-gfm remark-math rehype-katex rehype-mathjax rehype-raw
npm install shiki
npm install mermaid
npm install katex

# Rich editor
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-mention

# Layout and interaction
npm install react-infinite-scroll-component
npm install @hello-pangea/dnd
npm install react-hotkeys-hook
npm install motion
npm install partial-json

# React Flow (conversation graph — P3)
npm install @xyflow/react

# Class variance authority (for component variants)
npm install class-variance-authority

# Already installed: lucide-react, i18next, react-i18next, tailwindcss, zustand
```

## Development

```bash
# Run tests
npx vitest run tests/unit/

# Type check
npx tsc --noEmit

# Dev mode
npx electron-vite dev

# Build
npx electron-vite build
```

## Key Files

| Area | Path |
|------|------|
| Stores | `src/renderer/src/stores/useRuntimeStore.ts`, `useSettingsStore.ts`, `useInputToolsStore.ts` |
| Pages | `src/renderer/src/pages/home/` |
| Blocks | `src/renderer/src/pages/home/Messages/Blocks/` |
| Markdown | `src/renderer/src/pages/home/Markdown/` |
| Input | `src/renderer/src/pages/home/Inputbar/` |
| Sidebar | `src/renderer/src/pages/home/Tabs/` |
| Hooks | `src/renderer/src/hooks/` |
| Events | `src/renderer/src/services/EventService.ts` |
| UI components | `src/renderer/src/components/ui/` |
