# Style Tokens

> Extracted from Cherry Studio runtime via Playwright CDP — 2026-03-15

## CSS Custom Properties (Key)

| Property | Value |
|----------|-------|
| `--color-primary` | `#00b96b` |
| `--color-background` | `#181818` |
| `--color-background-soft` | `#222222` |
| `--color-background-mute` | `#333333` |
| `--color-text` | `rgba(255, 255, 245, 0.9)` |
| `--color-text-2` | `rgba(235, 235, 245, 0.6)` |
| `--color-text-3` | `rgba(235, 235, 245, 0.38)` |
| `--color-text-secondary` | `rgba(235, 235, 245, 0.7)` |
| `--color-border` | `#ffffff19` |
| `--color-border-soft` | `#ffffff10` |
| `--color-hover` | `rgba(40, 40, 40, 1)` |
| `--color-active` | `rgba(55, 55, 55, 1)` |
| `--color-icon` | `#ffffff99` |
| `--color-link` | `#338cff` |
| `--color-error` | `#f44336` |
| `--color-status-success` | `green` |
| `--color-status-warning` | `#faad14` |
| `--color-code-background` | `#323232` |
| `--color-inline-code-text` | `rgb(218, 97, 92)` |
| `--color-scrollbar-thumb` | `rgba(255, 255, 255, 0.15)` |
| `--color-primary-mute` | `#00b96b33` |
| `--color-primary-soft` | `#00b96b99` |
| `--color-reference` | `#404040` |
| `--color-reference-background` | `#0b0e12` |
| `--radius` | `0.625rem` |
| `--list-item-border-radius` | `10px` |
| `--spacing` | `0.25rem` |

## Font Families

| Property | Value |
|----------|-------|
| `--font-family` | `Ubuntu, -apple-system, system-ui, Roboto, Oxygen, Cantarell, 'Open Sans', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif` |
| `--font-family-serif` | `serif, -apple-system, system-ui, Ubuntu, Roboto` |
| `--code-font-family` | `'Cascadia Code', 'Fira Code', 'Consolas', Menlo, Courier, monospace` |
| `--font-weight-medium` | `500` |
| `--font-weight-semibold` | `600` |
| `--font-weight-bold` | `700` |

## Landmark Styles

| Element | Property | Value |
|---------|----------|-------|
| `body` | `font-family` | `Ubuntu, -apple-system, system-ui, ...sans-serif` |
| `body` | `font-size` | `14px` |
| `body` | `line-height` | `22.4px` |
| `body` | `color` | `rgba(255, 255, 245, 0.9)` |
| `#root` | `background` | `rgba(20, 20, 20, 0.55)` (transparent for vibrancy) |
| `#root` | `width` | `960px` (default window) |
| `#root` | `height` | `600px` (default window) |
| `navbar` | `height` | `44px` |
| `navbar` | `padding` | `0px 12px` |

## Typography

| Property | Value |
|----------|-------|
| `font-family` | `Ubuntu, -apple-system, system-ui, Roboto, ...sans-serif` |
| `font-size` | `14px` |
| `line-height` | `22.4px` (1.6) |
| `color` | `rgba(255, 255, 245, 0.9)` |

## Theme

- **Default theme**: Dark (system-following)
- **Color scheme**: Dark with semi-transparent vibrancy background
- **Primary color**: Green (`#00b96b`)
- **Accent**: Subtle purple-gray via oklch
