# F003 Settings — Interaction Surfaces

> Guard 6b artifact. All user-facing interaction points in the settings system.

| # | Surface | Component | Type | Verified |
|---|---------|-----------|------|----------|
| 1 | Settings sidebar navigation | SettingsSidebar | click → navigate to settings sub-route | ✅ Code review |
| 2 | Language select dropdown | GeneralSettings | change → i18n.changeLanguage + persist | ✅ Code review |
| 3 | Navbar position radio group | GeneralSettings | change → useTabsStore.setNavbarPosition + persist | ✅ Code review |
| 4 | Send key radio group | GeneralSettings | change → persist sendKey preference | ✅ Code review |
| 5 | Launch at login switch | GeneralSettings | toggle → app:setLoginItemSettings IPC | ✅ Code review |
| 6 | Start minimized switch | GeneralSettings | toggle → persist | ✅ Code review |
| 7 | Auto-update switch | GeneralSettings | toggle → persist | ✅ Code review |
| 8 | Proxy host input | GeneralSettings | change → persist | ✅ Code review |
| 9 | Proxy port input | GeneralSettings | change → persist | ✅ Code review |
| 10 | Quick phrase add | QuickPhraseEditor | click + → new phrase | ✅ Code review |
| 11 | Quick phrase edit | QuickPhraseEditor | click → inline edit | ✅ Code review |
| 12 | Quick phrase delete | QuickPhraseEditor | click trash → delete | ✅ Code review |
| 13 | Theme radio group | DisplaySettings | change → theme:set IPC | ✅ Code review |
| 14 | Font size slider | DisplaySettings | drag → live preview + persist | ✅ Code review |
| 15 | Message style radio group | DisplaySettings | change → persist | ✅ Code review |
| 16 | Avatar style radio group | DisplaySettings | change → persist | ✅ Code review |
| 17 | Code theme select | DisplaySettings | change → persist | ✅ Code review |
| 18 | Custom CSS textarea | DisplaySettings | change → persist + live apply | ✅ Code review |
| 19 | Export data button | DataSettings | click → dialog → download | ✅ Code review |
| 20 | Import data button | DataSettings | click → dialog → parse + apply | ✅ Code review |
| 21 | Clear data button | DataSettings | click → inline confirm → clear | ✅ Code review |
| 22 | Open storage folder button | DataSettings | click → shell:openPath IPC | ✅ Code review |
| 23 | Backup retention input | DataSettings | change → persist | ✅ Code review |
| 24 | Shortcut recorder | ShortcutSettings | click → capture key combo → persist | ✅ Code review |

## Controls in Source but Not in Target

| Source Control | Reason |
|----------------|--------|
| Tray on/off toggle | removed (tray always active in F001) |
| Tray-on-close toggle | removed |
| Hardware acceleration toggle | removed |
| Spell check toggle + language select | removed |
| Notification settings | removed |
| Data collection toggle | removed |
| Proxy mode selector (system/custom/none) | simplified — target has only custom proxy inputs |
| WebDAV sync config | removed |
| TopicPosition radio (left/right) | removed — target only supports left |
| Window opacity slider | removed |
