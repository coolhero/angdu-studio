# Style Tokens

> Extracted from Cherry Studio runtime (light theme active, dark theme CSS vars also captured)

## CSS Custom Properties

### Colors (Dark theme variables — defined in :root, toggled by body class)
| Property | Value |
|----------|-------|
| `--color-primary` | `#00b96b` |
| `--color-error` | `#f44336` |
| `--color-link` | `#338cff` |
| `--color-white` | `#ffffff` |
| `--color-black` | `#181818` |
| `--color-black-soft` | `#222222` |
| `--color-black-mute` | `#333333` |
| `--color-gray-1` | `#515c67` |
| `--color-gray-2` | `#414853` |
| `--color-gray-3` | `#32363f` |
| `--color-text-1` | `rgba(255, 255, 245, 0.9)` |
| `--color-text-2` | `rgba(235, 235, 245, 0.6)` |
| `--color-text-3` | `rgba(235, 235, 245, 0.38)` |
| `--color-border` | `#ffffff19` |
| `--color-hover` | `rgba(40, 40, 40, 1)` |
| `--color-active` | `rgba(55, 55, 55, 1)` |
| `--color-code-background` | `#323232` |
| `--color-inline-code-text` | `rgb(218, 97, 92)` |
| `--color-status-success` | `green` |
| `--color-status-warning` | `#faad14` |

### Layout
| Property | Value |
|----------|-------|
| `--navbar-height` | `44px` |
| `--sidebar-width` | `50px` |
| `--status-bar-height` | `40px` |
| `--input-bar-height` | `100px` |
| `--assistants-width` | `275px` |
| `--topic-list-width` | `275px` |
| `--settings-width` | `250px` |
| `--list-item-border-radius` | `10px` |
| `--scrollbar-width` | `5px` |
| `--scrollbar-height` | `6px` |
| `--radius` | `.625rem` |

### Chat
| Property | Value |
|----------|-------|
| `--chat-background` | `transparent` |
| `--chat-background-user` | `rgba(255, 255, 255, 0.08)` |
| `--chat-background-assistant` | `transparent` |
| `--navbar-background` | `#1f1f1f` |
| `--navbar-background-mac` | `rgba(20, 20, 20, 0.55)` |
| `--modal-background` | `#111111` |

### shadcn/ui (oklch) — already integrated in source
| Property | Value |
|----------|-------|
| `--background` | `oklch(100% 0 0)` |
| `--foreground` | `oklch(14.1% .005 285.823)` |
| `--primary` | `oklch(21% .006 285.885)` |
| `--primary-foreground` | `oklch(98.5% 0 0)` |
| `--secondary` | `oklch(96.7% .001 286.375)` |
| `--muted` | `oklch(96.7% .001 286.375)` |
| `--muted-foreground` | `oklch(55.2% .016 285.938)` |
| `--destructive` | `oklch(57.7% .245 27.325)` |
| `--border` | `oklch(92% .004 286.32)` |
| `--ring` | `oklch(70.5% .015 286.067)` |

## Typography
| Property | Value |
|----------|-------|
| `--font-family` | `var(--user-font-family), Ubuntu, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Roboto, Oxygen, Cantarell, 'Open Sans', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'` |
| `--font-family-serif` | `serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, ...` |
| `--code-font-family` | `var(--user-code-font-family), 'Cascadia Code', 'Fira Code', 'Consolas', Menlo, Courier, monospace` |
