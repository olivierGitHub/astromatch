# Story 1.4: Recover access when credentials are lost

Status: done

## Story

As a **registered user**,
I want **to recover access if I lose my credentials**,
So that **I can regain my account** (FR3).

## Acceptance Criteria

**Given** account recovery is enabled for the MVP method  
**When** I start recovery and follow the flow (e.g. email link or code—exact UX TBD)  
**Then** I can set new credentials or regain access per policy  
**And** errors are actionable (retry, contact support) and rate limiting applies (ties to FR42 on auth).

## Tasks / Subtasks

- [x] **Backend** — `password_reset_tokens` (Flyway); opaque token hashed; forgot (no enumeration) + reset; revoke all refresh tokens on success; cooldown per email (`RATE_LIMITED` 429).
- [x] **Config** — `astromatch.recovery.*` (expose token dev-only, cooldown, token TTL).
- [x] **API** — `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password`; security permit; `PasswordRecoveryIT`.
- [x] **Mobile** — `authenticatedFetch` + refresh on 401; forgot + reset screens from sign-in; OpenAPI 0.0.4.

## Change Log

- 2026-03-28: Password recovery API + mobile forgot/reset flow; `authenticatedFetch` / `refreshSession` single-flight refresh on 401; OpenAPI 0.0.4.

## Dev Agent Record

### Completion Notes

- **Recovery:** Reset token is URL-safe opaque string; only SHA-256 hash stored. Email delivery not in scope—production uses token from email link; local dev may set `astromatch.recovery.expose-reset-token=true` to receive token in JSON.
- **Mobile:** `setSessionInvalidationHandler` sends user to sign-in when refresh fails after 401.

### File List

- `api-contract/openapi.yaml`
- `astromatch-api/.env.example`
- `astromatch-api/src/main/resources/application.properties`
- `astromatch-api/src/main/resources/db/migration/V3__password_reset_tokens.sql`
- `astromatch-api/src/main/java/com/astromatch/api/AstromatchApiApplication.java`
- `astromatch-api/src/main/java/com/astromatch/api/config/RecoveryProperties.java`
- `astromatch-api/src/main/java/com/astromatch/api/config/SecurityConfiguration.java`
- `astromatch-api/src/main/java/com/astromatch/api/common/web/RestExceptionHandler.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/AuthController.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/AuthService.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/ForgotPasswordRequest.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/ForgotPasswordResponse.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/ForgotPasswordRateLimiter.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/InvalidResetTokenException.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/PasswordResetToken.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/PasswordResetTokenRepository.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/RateLimitExceededException.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/RefreshTokenRepository.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/ResetPasswordRequest.java`
- `astromatch-api/src/test/java/com/astromatch/api/PasswordRecoveryIT.java`
- `astromatch-mobile/App.tsx`
- `astromatch-mobile/src/features/auth/ForgotPasswordScreen.tsx`
- `astromatch-mobile/src/features/auth/ResetPasswordScreen.tsx`
- `astromatch-mobile/src/features/auth/SignInScreen.tsx`
- `astromatch-mobile/src/services/api-client/api-base.ts`
- `astromatch-mobile/src/services/api-client/authenticated-fetch.ts`
- `astromatch-mobile/src/services/api-client/forgot-password.ts`
- `astromatch-mobile/src/services/api-client/login.ts`
- `astromatch-mobile/src/services/api-client/logout.ts`
- `astromatch-mobile/src/services/api-client/me.ts`
- `astromatch-mobile/src/services/api-client/refresh-session.ts`
- `astromatch-mobile/src/services/api-client/register.ts`
- `astromatch-mobile/src/services/api-client/reset-password.ts`
- `astromatch-mobile/src/services/api-client/types.ts`
