# Angdu Studio — Demo Scripts

Each feature has an interactive demo and a CI health check mode.

## Usage

```bash
# Interactive — launches the app for manual testing
./demos/F001-app-shell.sh

# CI — build, launch, verify process starts, exit
./demos/F001-app-shell.sh --ci
```

## Available Demos

| Script | Feature | What it covers |
|--------|---------|----------------|
| `F001-app-shell.sh` | App Shell | Frameless window, title bar, tray, theme, window state persistence |
| `F002-navigation.sh` | Navigation | Sidebar icons, tab bar, tab lifecycle, drag-reorder, persistence |
| `F003-settings.sh` | Settings | General/Display/Data/Shortcuts pages, debounced IPC, theme toggling, export/import, shortcut recording |

## CI Mode

All scripts accept `--ci` to run a non-interactive health check:

1. Build the app (if needed)
2. Launch the Electron process
3. Verify it stays alive for a few seconds
4. Kill and exit with status code

Use in CI pipelines:

```bash
./demos/F003-settings.sh --ci
```
