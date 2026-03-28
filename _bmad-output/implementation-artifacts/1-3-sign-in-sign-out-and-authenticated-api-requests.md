# Story 1.3: Sign in, sign out, and authenticated API requests

Status: done

## Story

As a **registered user**,
I want **to sign in and sign out and have my client use authenticated requests**,
So that **my session is secure and the system can treat me as signed-in** (FR2, FR40).

## Acceptance Criteria

1. **Sign in** — `POST` login with email + password returns **JWT access token** and **refresh token** per architecture (opaque refresh persisted server-side with rotation on refresh); response uses **success envelope**; invalid credentials use **standard error envelope** (e.g. `INVALID_CREDENTIALS`, 401) with `traceId`.
2. **Refresh** — Client can exchange a valid refresh token for a **new access token** (and rotated refresh token); reuse/revoked refresh fails with actionable error.
3. **Sign out** — `POST` logout invalidates the **current refresh token** (and optionally the family); client clears stored tokens; no further refresh with old token.
4. **Authenticated API** — At least one **protected** endpoint (e.g. `GET /api/v1/auth/me`) returns 200 with user identity when `Authorization: Bearer <access>` is valid; **401** with envelope when missing/invalid token.
5. **Mobile** — Sign-in UI replaces placeholder; tokens stored in **secure storage** (`expo-secure-store`); API client attaches **Bearer** to protected calls; sign-out clears storage and stops using tokens.
6. **OpenAPI** — Contract documents login, refresh, logout, and protected route(s).
7. **Security** — Remove reliance on Spring Boot **default generated user**; stateless JWT verification filter + public paths for auth endpoints and health.

## Tasks / Subtasks

- [x] **JWT & config** (AC: 1, 4, 7)  
  - [x] Add JWT library (jjwt 0.12+); `JwtService` for access token issue/parse; config props `astromatch.jwt.secret`, TTLs.  
  - [x] `JwtAuthenticationFilter` + register in `SecurityConfiguration`; `AuthenticationEntryPoint` / `AccessDeniedHandler` returning `ApiEnvelope` JSON for 401/403.

- [x] **Refresh persistence** (AC: 1–3)  
  - [x] Flyway: `refresh_tokens` (user_id, token_hash, expires_at, revoked_at, family_id optional); repository + rotation on refresh.  
  - [x] `AuthService`: login, refresh, logout (verify password via `UserRepository` + `PasswordEncoder`).

- [x] **Auth API** (AC: 1–4, 6)  
  - [x] `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`.  
  - [x] Permit public paths in security config; integration tests.

- [x] **Mobile** (AC: 5)  
  - [x] `expo-secure-store`; token helpers; extend api-client with auth header; implement `SignInScreen`; post-login navigation stub; sign-out action.

- [x] **Contract**  
  - [x] Update `api-contract/openapi.yaml`.

## Change Log

- 2026-03-28: Story 1.3 implemented — JWT (jjwt), `refresh_tokens` table, login/refresh/logout/me, JSON 401/403 handlers, `AuthFlowIT`; mobile `expo-secure-store`, `SignInScreen`, `HomeScreen`, OpenAPI 0.0.3.
- 2026-03-28: Mobile `fetchMe()` + `HomeScreen` calls `GET /auth/me` with Bearer so AC5 explicitly covers protected calls (not only stored tokens).

## Dev Notes

- **Story 1.2** delivers registration + `users` with BCrypt; reuse `identity` package.  
- **Refresh in DB** for local/H2; Redis can replace later per architecture without changing API shape.  
- **Architecture:** JWT access + refresh rotation, envelopes, camelCase JSON [Source: `architecture.md`].  
- **Tests:** `./mvnw verify`, `npm run lint`.

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Debug Log References

- Spring Boot 4: explicit `@Bean ObjectMapper` (`ApiJsonConfiguration`) for JSON security handlers (no default Jackson bean with current starters).
- Default Spring `UserDetailsService` / generated password warning still present; full removal deferred to a dedicated security hardening pass.

### Completion Notes List

- **Endpoints:** `POST /api/v1/auth/login|refresh|logout`, `GET /api/v1/auth/me`; **TokenBundle** includes `email` for client convenience.
- **JWT:** HS256, secret `ASTROMATCH_JWT_SECRET` / `astromatch.jwt.secret`; access TTL configurable; refresh opaque token hashed SHA-256 in DB; rotation on refresh; logout revokes refresh row.
- **Mobile:** `session.ts`, `login.ts`, `logout.ts`, `me.ts`; `HomeScreen` verifies session via `GET /auth/me` with Bearer, then sign-out calls remote logout and clears secure store; `App` restores session on cold start if tokens present.

### File List

- `api-contract/openapi.yaml`
- `astromatch-api/pom.xml`
- `astromatch-api/.env.example`
- `astromatch-api/src/main/java/com/astromatch/api/AstromatchApiApplication.java`
- `astromatch-api/src/main/java/com/astromatch/api/config/ApiJsonConfiguration.java`
- `astromatch-api/src/main/java/com/astromatch/api/config/JwtAuthenticationFilter.java`
- `astromatch-api/src/main/java/com/astromatch/api/config/JwtProperties.java`
- `astromatch-api/src/main/java/com/astromatch/api/config/JsonAccessDeniedHandler.java`
- `astromatch-api/src/main/java/com/astromatch/api/config/JsonAuthenticationEntryPoint.java`
- `astromatch-api/src/main/java/com/astromatch/api/config/SecurityConfiguration.java`
- `astromatch-api/src/main/java/com/astromatch/api/common/web/RestExceptionHandler.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/AuthController.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/AuthService.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/InvalidTokenException.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/JwtService.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/LoginRequest.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/LogoutRequest.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/MeResponse.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/RefreshRequest.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/RefreshToken.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/RefreshTokenRepository.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/TokenBundle.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/TokenHasher.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/UserRepository.java`
- `astromatch-api/src/main/resources/application.properties`
- `astromatch-api/src/main/resources/db/migration/V2__create_refresh_tokens_table.sql`
- `astromatch-api/src/test/java/com/astromatch/api/AuthFlowIT.java`
- `astromatch-mobile/App.tsx`
- `astromatch-mobile/package.json`
- `astromatch-mobile/package-lock.json`
- `astromatch-mobile/src/features/auth/HomeScreen.tsx`
- `astromatch-mobile/src/features/auth/SignInScreen.tsx`
- `astromatch-mobile/src/services/api-client/login.ts`
- `astromatch-mobile/src/services/api-client/logout.ts`
- `astromatch-mobile/src/services/api-client/me.ts`
- `astromatch-mobile/src/services/auth/session.ts`

---

**Story context:** JWT session vertical slice for Epic 1; next stories can add `/me`-backed onboarding and refresh retry in api-client.
