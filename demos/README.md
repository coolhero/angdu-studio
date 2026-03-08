# Demo Hub

## Available Demos

| Feature | Script | Description |
|---------|--------|-------------|
| F001-app-core | `./demos/F001-app-core.sh` | Launches the Electron shell — window management, theme switching, config persistence, zoom controls, tray icon |
| F002-ai-provider | `./demos/F002-ai-provider.sh` | Launches with AI provider system — provider CRUD via DevTools, model selection, IPC channel verification |

## Usage

```bash
# Interactive — launches the app for hands-on testing
./demos/F001-app-core.sh

# CI — automated health check (build, test, stability)
./demos/F001-app-core.sh --ci
```
