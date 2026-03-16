# F001 App Shell — Interaction Surfaces

> Guard 6b artifact. F001 is main-process infrastructure with minimal user-facing surfaces.

| # | Surface | Component | Type | Verified |
|---|---------|-----------|------|----------|
| 1 | System tray icon click | TrayService | click → toggle window visibility | ✅ Code review |
| 2 | System tray right-click menu | TrayService | contextMenu → Show/Quit | ✅ Code review |
| 3 | Deep link handling (angdu://) | ProtocolService | URL protocol → app action | ✅ Code review |
| 4 | Global keyboard shortcut | ShortcutService | shortcut → toggle window | ✅ Code review |
| 5 | Auto-update notification | UpdateService | system dialog → update/dismiss | ✅ Code review |

F001 has no renderer-side interactive UI of its own. Window chrome (title bar, min/max/close) is owned by F002 Navigation.
