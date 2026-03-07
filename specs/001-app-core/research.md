# Research: App Core

**Feature Branch**: `001-app-core`
**Date**: 2026-03-07

## Research Summary

All technical decisions for F001-app-core are pre-determined by the constitution and stack migration plan. No NEEDS CLARIFICATION items exist. This research documents the key decisions and their rationale.

## Decision 1: Electron 3-Process Architecture

**Decision**: Maintain the standard Electron main/renderer/preload separation with typed IPC bridge.

**Rationale**: Constitution Principle I (Multi-Process Architecture) mandates this. The original Cherry Studio architecture is well-proven with 280+ IPC handlers and 344 channel enum members. No reason to deviate.

**Alternatives considered**:
- Single-process (rejected: violates Electron security model)
- Web-only (rejected: requires desktop features like tray, global shortcuts, file system access)

## Decision 2: Zustand for State Management

**Decision**: Use Zustand with persist middleware, replacing Redux Toolkit + Redux Persist.

**Rationale**: Constitution Principle IV (Entity-Store Separation) specifies Zustand. Less boilerplate than Redux. Cross-window sync via BroadcastChannel is simpler than Redux middleware.

**Key patterns**:
- One store per domain slice (Constitution § 6.5)
- `useShallow` for selectors to prevent unnecessary re-renders
- `persist` middleware for stores that survive restart
- Custom `syncMiddleware` using BroadcastChannel API for cross-window state sync

**Alternatives considered**:
- Keep Redux Toolkit (rejected: migration decision already made in constitution)
- Jotai/Recoil (rejected: Zustand better fits singleton service pattern)

## Decision 3: shadcn/ui + Tailwind CSS 4 Theme System

**Decision**: CSS variable-based theming using Tailwind CSS 4 `@theme` directive. Dark mode via `.dark` class on root element.

**Rationale**: Constitution § 6.4 mandates Tailwind CSS 4 utilities and shadcn/ui primitives. CSS variables provide runtime theme switching without JS runtime overhead.

**Key patterns**:
- `@theme` directive in `app.css` defines design tokens as CSS custom properties
- `.dark` class toggle on `<html>` element for dark mode
- `cn()` utility (clsx + tailwind-merge) for conditional class composition
- Theme values accessible via `var(--color-name)` in both Tailwind utilities and custom CSS

**Alternatives considered**:
- CSS-in-JS theming (rejected: migrating away from Styled Components)
- Ant Design ConfigProvider tokens (rejected: migrating away from Ant Design)

## Decision 4: electron-store for Configuration

**Decision**: Use electron-store for persistent key-value configuration with a custom observer pattern wrapper.

**Rationale**: electron-store is the de facto standard for Electron config persistence. The observer pattern allows reactive updates across the application without polling.

**Key patterns**:
- ConfigManager singleton wraps electron-store
- `subscribe(key, callback)` for reactive change notifications
- `get(key, defaultValue)` / `set(key, value)` API
- Schema validation via Zod for config values
- Fallback to defaults on corrupted store

## Decision 5: Winston Structured Logging

**Decision**: Winston with daily file rotation and module-level filters.

**Rationale**: Constitution Principle X (Observable by Default) requires structured logging. Winston is already in the retained stack.

**Key patterns**:
- JSON format with timestamp, level, module, message fields
- Daily rotation via `winston-daily-rotate-file`
- Module filter: `ANGDU_LOGGER_MAIN_SHOW_MODULES` env var
- Log level: `ANGDU_LOGGER_MAIN_LEVEL` env var (default: `info`)

## Decision 6: IPC Type Safety

**Decision**: Shared IPC channel enum (`IpcChannel`) with typed handler/invoker pairs.

**Rationale**: Constitution Principle IX (Type Safety End-to-End) and Principle V (Event-Driven Communication) require typed IPC. The channel enum ensures compile-time verification of channel names.

**Key patterns**:
- `src/shared/IpcChannel.ts` defines all channel names as an enum
- Typed `ipcMain.handle<TRequest, TResponse>` wrappers
- Typed `ipcRenderer.invoke<TRequest, TResponse>` via preload bridge
- Zod schemas for IPC payloads at the boundary
