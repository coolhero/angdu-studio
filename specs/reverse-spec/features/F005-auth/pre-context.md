# Pre-Context: Auth

**Feature ID**: F005-auth
**Tier**: Tier 2
**Generated**: 2026-03-07

---

## Source Reference

**Source Root**: `/Users/coolhero/Develop/cherry-studio`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/services/AnthropicService.ts` | Anthropic OAuth PKCE flow, credential file management |
| `src/main/services/CopilotService.ts` | GitHub Copilot device code OAuth flow, token storage |
| `src/main/services/CherryINOAuthService.ts` | CherryIN (->AngduIN) OAuth token exchange, refresh |
| `src/main/services/VertexAIService.ts` | Google Vertex AI auth header generation |
| `src/renderer/src/components/OAuth/` | OAuth UI components (login buttons, callback handlers) |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **PKCE OAuth flow (Anthropic), device code flow (Copilot), AngduIN token exchange and refresh, Vertex AI auth header generation, credential encryption via safeStorage, token expiration checking, exponential backoff polling for device code flow, credential clearing logic, certificate-based signing**
- Do not reference: Ant Design components in OAuth UI (migrating to shadcn/ui + Radix), styled-components styling (migrating to Tailwind-only), Redux patterns (migrating to Zustand)
- **Extract**: PKCE code challenge/verifier generation, OAuth callback server setup, token refresh logic with expiration checks, device code polling with exponential backoff, safeStorage encryption for credentials, Vertex AI service account auth header construction, AngduIN token exchange protocol, credential file read/write patterns, certificate path resolution
- **Ignore**: Ant Design `Button` / `Modal` / `Spin` components in OAuth UI, styled-components wrappers, Redux slice patterns

### Naming Remapping

| Original | Angdu Equivalent | Scope |
|----------|-----------------|-------|
| `CherryINOAuthService` | `AngduINOAuthService` | Class/file name |
| `cherryin:*` IPC channels | `angduin:*` IPC channels | IPC channel prefix |
| `CHERRY_CERT_PATH` | `ANGDU_CERT_PATH` | Environment variable |
| `CHERRY_CERT_*` | `ANGDU_CERT_*` | Environment variable prefix |

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.
> These files cannot be regenerated -- they must be copied as-is and placed in the appropriate location in the new project.
> Source Path is **relative to Source Root** (same as file paths above). Resolve as `[Source Root]/[Source Path]` at runtime.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| (none) | | | Auth has no static resources; credentials are generated at runtime |

> If resources need modification (e.g., resizing images, updating translation keys), note it in the Usage column.

### Environment Variables

> Environment variables required by this Feature at runtime. Variables marked as `secret` must NOT have their actual values recorded here -- only the variable name and purpose.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| `APPLE_ID` | secret | No | Apple ID for code signing | (secret) |
| `APPLE_TEAM_ID` | secret | No | Apple Developer Team ID | (secret) |
| `ANGDU_CERT_PATH` | secret | No | Path to signing certificate | (secret) |

**Shared variables** (defined by other Features but also used here):

| Variable | Owner Feature | Usage in This Feature |
|----------|--------------|----------------------|
| `CSLOGGER_MAIN_LEVEL` | F001-app-core | Log level for main process OAuth service logging |

---

## SBI Coverage

**SBI Range**: B141-B165

| SBI ID | Priority | Description |
|--------|----------|-------------|
| B141 | P1 | PKCE OAuth flow (Anthropic) -- code challenge/verifier, authorization URL, callback server |
| B142 | P1 | Token refresh -- detect expiration, refresh token exchange, update stored credentials |
| B143 | P1 | Credential encryption -- safeStorage encrypt/decrypt for token persistence |
| B144 | P1 | Device code flow (Copilot) -- device code request, user code display, polling |
| B145 | P2 | Exponential backoff polling -- progressive delay during device code authorization wait |
| B146 | P1 | AngduIN token exchange -- exchange authorization code for access/refresh tokens |
| B147 | P2 | Vertex AI auth headers -- service account credential loading, JWT signing, header injection |
| B148 | P2 | Clear credentials -- remove stored tokens, revoke if supported, reset auth state |
| B149 | P2 | Check expiration -- token TTL validation, proactive refresh before expiry |
| B150-B165 | P2-P3 | Additional auth behaviors: OAuth error handling, retry logic, multi-account support, auth state broadcasting, secure credential migration, callback URL validation, CORS handling, token scope validation, auth UI state management, login/logout flow orchestration |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F005-auth provides OAuth authentication flows for multiple providers: Anthropic (PKCE OAuth with code challenge/verifier and callback server), GitHub Copilot (device code flow with exponential backoff polling), AngduIN (token exchange and refresh), and Vertex AI (service account auth headers). It manages credential lifecycle including encryption via Electron's safeStorage, token refresh with expiration checking, and secure credential clearing. The feature handles the complete OAuth lifecycle from initial authorization through token maintenance and revocation.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Anthropic OAuth login | User initiates Anthropic login; PKCE flow opens browser, callback server receives code, tokens exchanged and stored encrypted |
| P1 | Copilot device code login | User initiates Copilot login; device code displayed, user authorizes in browser, polling detects completion with exponential backoff |
| P1 | Token refresh | Token nearing expiration; system proactively refreshes using stored refresh token without user intervention |
| P1 | AngduIN authentication | User authenticates with AngduIN service; authorization code exchanged for tokens |
| P2 | Vertex AI auth | System loads service account credentials and generates signed auth headers for Vertex AI API calls |
| P2 | Credential clearing | User logs out of a provider; stored credentials are removed and auth state is reset |
| P2 | Expiration check | System checks token validity before API calls; expired tokens trigger refresh or re-authentication |
| P3 | Auth error recovery | OAuth flow fails (network error, user denial); graceful error handling with user feedback |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: PKCE OAuth flow for Anthropic (code challenge/verifier, authorization URL, local callback server)
- **FR-002**: Device code flow for Copilot (device code request, user code display, polling with exponential backoff)
- **FR-003**: AngduIN token exchange (authorization code -> access/refresh tokens)
- **FR-004**: Vertex AI service account auth header generation (JWT signing)
- **FR-005**: Credential encryption via safeStorage for persistent token storage
- **FR-006**: Token refresh with expiration detection and proactive renewal
- **FR-007**: Credential clearing and auth state reset
- **FR-008**: OAuth callback server lifecycle (start, receive code, shutdown)
- **FR-009**: Auth state broadcasting to renderer process

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: Anthropic PKCE OAuth flow completes successfully and stores encrypted tokens
- **SC-002**: Copilot device code flow completes within polling timeout with exponential backoff
- **SC-003**: Token refresh occurs proactively before expiration without user intervention
- **SC-004**: Credential clearing removes all stored tokens and resets auth state
- **SC-005**: Vertex AI auth headers are correctly signed and accepted by the API
- **SC-006**: OAuth callback server starts and stops cleanly without port conflicts
- **SC-007**: Auth errors are handled gracefully with appropriate user feedback

### Edge Cases

- OAuth callback server port already in use; fallback or error reporting
- Token refresh fails due to revoked refresh token; prompt re-authentication
- Network failure during device code polling; retry with backoff, eventual timeout
- Multiple concurrent OAuth flows for different providers; isolation and deduplication
- safeStorage unavailable (e.g., no keychain on Linux); fallback credential storage
- Callback URL mismatch between registered app and runtime; clear error message
- User closes browser during OAuth flow; timeout detection and cleanup
- Token expiration during an active API call; queue and retry after refresh

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-app-core | Infrastructure | Uses IPC framework for auth state communication, config persistence for credential storage, safeStorage access |

### Related Entities (data-model.md draft)

#### Owned Entities

**OAuthCredential** -- Stored encrypted credentials per provider

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| providerId | string | PK | Provider identifier (anthropic, copilot, angduin, vertex) |
| accessToken | string | encrypted | OAuth access token |
| refreshToken | string | encrypted, optional | OAuth refresh token |
| expiresAt | number | optional | Token expiration timestamp |
| tokenType | string | optional | Token type (Bearer, etc.) |
| scope | string | optional | Granted OAuth scopes |

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| Provider | F002-ai-provider | Read | Determine which auth flow to use for a given provider |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| IPC | `auth:anthropic-login` | Initiate Anthropic PKCE OAuth flow |
| IPC | `auth:copilot-login` | Initiate Copilot device code flow |
| IPC | `angduin:login` | Initiate AngduIN OAuth flow |
| IPC | `auth:refresh-token` | Refresh expired token for a provider |
| IPC | `auth:clear-credentials` | Clear stored credentials for a provider |
| IPC | `auth:check-status` | Check current auth status for a provider |
| IPC | `auth:vertex-headers` | Generate Vertex AI auth headers |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| IPC | `config:*` | F001-app-core | Persist credential metadata and auth state |
| IPC | `app:*` | F001-app-core | Access app paths for credential file storage |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Auth logic is entirely in the main process (Node.js services). AnthropicService implements PKCE with a local HTTP callback server. CopilotService implements device code flow with exponential backoff. CherryINOAuthService handles token exchange. VertexAIService handles service account JWT signing. All use safeStorage or file-based credential persistence. Renderer-side components display login buttons and status.
- **Recommended implementation approach**: Keep ALL main process auth services intact as they are stack-independent. Rename CherryINOAuthService to AngduINOAuthService and update IPC channel prefixes (cherryin:* -> angduin:*). Replace renderer-side OAuth UI components (Ant Design -> shadcn/ui). Replace any Redux auth state with Zustand store.
- **Caveats**: Auth services are almost entirely main process logic with minimal UI. The migration effort is low -- primarily renaming and IPC channel updates. Ensure ANGDU_CERT_* environment variables are updated in build scripts.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Auth token availability | F002-ai-provider | Verify F002 can retrieve auth tokens from F005 for authenticated provider API calls |
| AngduIN auth flow | F010-agent | Verify F010 can trigger AngduIN authentication when agent features require it |
| IPC channel registration | F001-app-core | Verify F005's auth:* and angduin:* IPC channels are registered in F001's IPC handler |
| Credential persistence | F001-app-core | Verify F005's credential storage integrates correctly with F001's config and file storage |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F002-ai-provider | Auth flow change | If OAuth flow signatures or token format changes, F002's provider authentication needs modification |
| F010-agent | Auth dependency | If AngduIN auth API changes, F010's agent authentication flow needs modification |
| F001-app-core | IPC channel change | If auth IPC channels are renamed or signatures change, F001's IPC registration needs updating |
