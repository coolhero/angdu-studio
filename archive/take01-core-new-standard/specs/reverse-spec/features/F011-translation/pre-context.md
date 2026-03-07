# Pre-Context: Translation

**Feature ID**: F011
**Tier**: Tier 3
**Generated**: 2026-03-02

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/renderer/src/store/translate.ts` | Translation Redux slice |
| `src/renderer/src/types/index.ts` | TranslateHistory, CustomTranslateLanguage types |
| `src/renderer/src/pages/translate/` | Translation UI page |
| `src/renderer/src/databases/index.ts` | Dexie translate_history, translate_languages tables |

### Reference Guide

#### [New Stack] Logic-Only Reference
- Extract: Translation prompt patterns, language code taxonomy, history storage, custom language support
- Ignore: Redux translate slice, Ant Design translation UI

### Static Resources

None.

### Environment Variables

None.

---

## For /speckit.specify

### Existing Feature Summary

Translation provides AI-powered text translation with history tracking. Uses the configured translateModel to translate between languages. History stored in Dexie with star/favorite support. Custom language definitions supported.

### Draft Requirements

- **FR-072**: Implement translation using configured AI model
- **FR-073**: Implement translation history with Dexie persistence
- **FR-074**: Support custom language definitions
- **FR-075**: Implement auto-copy translated text option

### Draft Acceptance Criteria

- **SC-042**: Translation completes and displays result
- **SC-043**: History persists across app restarts with star support
- **SC-044**: Custom languages appear in language selector

---

## For /speckit.plan

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F003-provider-management | Model | Uses translateModel from provider config |
| F005-ai-completion | API call | Translation calls go through AI completion |

### Related Entities

#### Owned Entities

**TranslateHistory** — 6 fields
**CustomTranslateLanguage** — 4 fields

---

## For /speckit.analyze

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Model reference | F003 | Verify translateModel is correctly configured |
| Translation blocks | F004 | Verify translation message blocks render correctly |
