# Style Tokens

> Extracted from runtime via Playwright — 2026-03-14

## CSS Custom Properties (Key Tokens)

### Colors
| Property | Value |
|----------|-------|
| `--color-primary` | `#00b96b` |
| `--color-primary-soft` | `#00b96b99` |
| `--color-primary-mute` | `#00b96b33` |
| `--color-background` | `#181818` |
| `--color-background-soft` | `#222222` |
| `--color-background-mute` | `#333333` |
| `--color-background-opacity` | `rgba(34, 34, 34, 0.7)` |
| `--color-black` | `#181818` |
| `--color-black-soft` | `#222222` |
| `--color-black-mute` | `#333333` |
| `--color-white` | `#ffffff` |
| `--color-white-soft` | `rgba(255, 255, 255, 0.8)` |
| `--color-text` | `rgba(255, 255, 245, 0.9)` |
| `--color-text-1` | `rgba(255, 255, 245, 0.9)` |
| `--color-text-2` | `rgba(235, 235, 245, 0.6)` |
| `--color-text-3` | `rgba(235, 235, 245, 0.38)` |
| `--color-text-secondary` | `rgba(235, 235, 245, 0.7)` |
| `--color-border` | `#ffffff19` |
| `--color-border-soft` | `#ffffff10` |
| `--color-frame-border` | `#333` |
| `--color-icon` | `#ffffff99` |
| `--color-icon-white` | `#ffffff` |
| `--color-hover` | `rgba(40, 40, 40, 1)` |
| `--color-active` | `rgba(55, 55, 55, 1)` |
| `--color-highlight` | `rgba(0, 0, 0, 1)` |
| `--color-error` | `#f44336` |
| `--color-status-success` | `green` |
| `--color-status-error` | `#f44336` |
| `--color-status-warning` | `#faad14` |
| `--color-list-item` | `rgba(255, 255, 255, 0.1)` |
| `--color-list-item-hover` | `rgba(255, 255, 255, 0.05)` |
| `--color-group-background` | `#222222` |
| `--color-inline-code-background` | `#323232` |
| `--color-inline-code-text` | `rgb(218, 97, 92)` |
| `--color-code-background` | `#323232` |
| `--color-reference` | `#404040` |
| `--color-reference-text` | `#ffffff` |
| `--color-reference-background` | `#0b0e12` |
| `--color-scrollbar-thumb` | `rgba(255, 255, 255, 0.15)` |
| `--color-scrollbar-thumb-hover` | `rgba(255, 255, 255, 0.2)` |
| `--navbar-background` | `#1f1f1f` |
| `--navbar-background-mac` | `rgba(20, 20, 20, 0.55)` |
| `--chat-background` | `transparent` |
| `--chat-background-user` | `rgba(255, 255, 255, 0.08)` |
| `--chat-text-user` | `#181818` |

### Layout
| Property | Value |
|----------|-------|
| `--navbar-height` | `44px` |
| `--sidebar-width` | `50px` |
| `--settings-width` | `250px` |
| `--assistants-width` | `275px` |
| `--topic-list-width` | `275px` |
| `--input-bar-height` | `100px` |
| `--status-bar-height` | `40px` |
| `--scrollbar-width` | `5px` |
| `--scrollbar-height` | `6px` |
| `--list-item-border-radius` | `10px` |
| `--radius` | `.625rem` |
| `--radius-2xl` | `1rem` |
| `--spacing` | `.25rem` |

### Typography
| Property | Value |
|----------|-------|
| `--font-family` | `'', Ubuntu, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Roboto, Oxygen, Cantarell, 'Open Sans', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, ...` |
| `--font-family-serif` | `serif, -apple-system, BlinkMacSystemFont, ...` |
| `--font-mono` | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace` |
| `--code-font-family` | `'', 'Cascadia Code', 'Fira Code', 'Consolas', Menlo, Courier, monospace` |
| `--text-xs` | `.75rem` |
| `--text-sm` | `.875rem` |
| `--text-base--line-height` | `calc(1.5 / 1)` |
| `--text-lg` | `1.125rem` |
| `--text-xl` | `1.25rem` |
| `--text-2xl` | `1.5rem` |
| `--font-weight-medium` | `500` |
| `--font-weight-semibold` | `600` |
| `--font-weight-bold` | `700` |

### Animation
| Property | Value |
|----------|-------|
| `--default-transition-duration` | `.15s` |
| `--default-transition-timing-function` | `cubic-bezier(.4, 0, .2, 1)` |
| `--ease-in-out` | `cubic-bezier(.4, 0, .2, 1)` |
| `--ease-out` | `cubic-bezier(0, 0, .2, 1)` |
| `--animate-pulse` | `pulse 2s cubic-bezier(.4, 0, .6, 1) infinite` |
| `--animate-spin` | `spin 1s linear infinite` |

## Landmark Styles
| Element | Property | Value |
|---------|----------|-------|
| `body` | `font-family` | Ubuntu, -apple-system, system-ui, ... |
| `body` | `font-size` | `14px` |
| `body` | `color` | `rgb(0, 0, 0)` (overridden by CSS vars) |
| `body` | `background-color` | `transparent` (Electron) |

## Window Dimensions
| Property | Value |
|----------|-------|
| Default width | 1280px |
| Default height | 800px |
