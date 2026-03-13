# Style Tokens

> Extracted from Cherry Studio runtime — 2026-03-13

## CSS Custom Properties

| Property | Value |
|----------|-------|
| `--color-white` | `#ffffff` |
| `--color-white-soft` | `rgba(255, 255, 255, 0.8)` |
| `--color-white-mute` | `rgba(255, 255, 255, 0.94)` |
| `--color-black` | `#181818` |
| `--color-black-soft` | `#222222` |
| `--color-black-mute` | `#333333` |
| `--color-gray-1` | `#515c67` |
| `--color-gray-2` | `#414853` |
| `--color-gray-3` | `#32363f` |
| `--color-text-1` | `rgba(255, 255, 245, 0.9)` |
| `--color-text-2` | `rgba(235, 235, 245, 0.6)` |
| `--color-text-3` | `rgba(235, 235, 245, 0.38)` |
| `--color-background` | `var(--color-black)` |
| `--color-background-soft` | `var(--color-black-soft)` |
| `--color-background-mute` | `var(--color-black-mute)` |
| `--color-background-opacity` | `rgba(34, 34, 34, 0.7)` |
| `--color-primary` | `#00b96b` |
| `--color-primary-soft` | `#00b96b99` |
| `--color-primary-mute` | `#00b96b33` |
| `--color-text` | `var(--color-text-1)` |
| `--color-text-secondary` | `rgba(235, 235, 245, 0.7)` |
| `--color-icon` | `#ffffff99` |
| `--color-icon-white` | `#ffffff` |
| `--color-border` | `#ffffff19` |
| `--color-border-soft` | `#ffffff10` |
| `--color-border-mute` | `#ffffff05` |
| `--color-error` | `#f44336` |
| `--color-link` | `#338cff` |
| `--color-code-background` | `#323232` |
| `--color-inline-code-background` | `#323232` |
| `--color-inline-code-text` | `rgb(218, 97, 92)` |
| `--color-hover` | `rgba(40, 40, 40, 1)` |
| `--color-active` | `rgba(55, 55, 55, 1)` |
| `--color-frame-border` | `#333` |
| `--color-reference` | `#404040` |
| `--color-reference-text` | `#ffffff` |
| `--color-reference-background` | `#0b0e12` |
| `--color-list-item` | `rgba(255, 255, 255, 0.1)` |

## Landmark Styles

| Element | Property | Value |
|---------|----------|-------|
| `body` | `background` | `rgba(0, 0, 0, 0)` (transparent — custom titlebar) |
| `body` | `color` | `rgb(0, 0, 0)` |
| `body` | `fontSize` | `14px` |
| `body` | `padding` | `0px` |

## Typography

| Property | Value |
|----------|-------|
| `font-family` | `Ubuntu, -apple-system, system-ui, Segoe UI, Roboto, Oxygen, Cantarell, Open Sans, Helvetica Neue, Arial, Noto Sans, sans-serif` |
| `font-size` | `14px` |
| `line-height` | `22.4px` (1.6 ratio) |
| `color` | Theme-dependent (dark: `rgba(255, 255, 245, 0.9)`) |
| `background-color` | Theme-dependent (dark: `#181818`) |

## Layout Variables

| Variable | Usage |
|----------|-------|
| `--sidebar-width` | Vertical icon sidebar width |
| `--navbar-height` | Top navbar/titlebar height |
| `--inner-glow-opacity` | `0.3` |
