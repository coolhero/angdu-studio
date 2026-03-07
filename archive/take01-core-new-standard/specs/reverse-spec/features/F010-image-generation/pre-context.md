# Pre-Context: Image Generation

**Feature ID**: F010
**Tier**: Tier 3
**Generated**: 2026-03-02

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/renderer/src/store/paintings.ts` | Paintings Redux slice (multi-provider state) |
| `src/renderer/src/types/index.ts` | Painting type variants (lines 333-469) |
| `src/renderer/src/pages/paintings/` | Painting UI pages |
| `src/renderer/src/aiCore/legacy/middleware/ImageGenerationMiddleware.ts` | Image generation middleware |

### Reference Guide

#### [New Stack] Logic-Only Reference
- Extract: Painting provider types, generation parameters per provider, async polling patterns (TokenFlux, PPIO), image storage
- Ignore: Redux paintings slice, Ant Design painting UI

### Static Resources

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| `src/renderer/src/assets/images/paintings/` | Image | `src/renderer/src/assets/images/paintings/` | 7 SVG painting icons |

### Environment Variables

None.

---

## For /speckit.specify

### Existing Feature Summary

Image Generation provides AI image creation through multiple providers: SiliconFlow, PPIO (with task polling), TokenFlux (with async generation), ZhiPu, AihubMix, OpenAI (DALL-E), and OVMS. Each provider has its own parameter set (model, prompt, negative prompt, size, seed, steps, guidance scale) and generation workflow.

### Draft Requirements

- **FR-068**: Implement image generation with provider-specific parameters
- **FR-069**: Support async generation with polling (TokenFlux, PPIO)
- **FR-070**: Implement image storage and gallery view
- **FR-071**: Support multiple image sizes and aspect ratios

### Draft Acceptance Criteria

- **SC-039**: Image generation completes with result displayed in gallery
- **SC-040**: Async providers show progress and complete within timeout
- **SC-041**: Generated images persist across app restarts

---

## For /speckit.plan

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F003-provider-management | Provider config | Image generation providers use Provider entity |
| F005-ai-completion | Pipeline | Routes through completion pipeline for some providers |

### Related Entities

#### Owned Entities

**Painting (variants)** — Multiple types: Painting, GeneratePainting, TokenFluxPainting, PpioPainting

---

## For /speckit.analyze

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Provider config | F003 | Verify image generation provider configs are compatible |
| Image routing | F005 | Verify image endpoints route correctly through pipeline |
