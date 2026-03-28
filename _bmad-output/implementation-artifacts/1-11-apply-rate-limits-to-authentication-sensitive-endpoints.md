# Story 1.11: Apply rate limits to authentication-sensitive endpoints

Status: done

## Story

As a **system**,
I want **rate limits on login, recovery, and other abuse-prone auth actions**,
So that **credential stuffing and abuse are mitigated** (FR42, auth scope).

## Acceptance Criteria

**Given** deployed API with Redis or equivalent per architecture  
**When** auth endpoints exceed configured thresholds  
**Then** requests are throttled with actionable client messaging and traceId  
**And** limits are configurable per environment.

**Maps:** FR42; architecture Redis usage.

## Tasks / Subtasks

- [x] **Sliding window** — `SlidingWindowRateLimiter` + `RateLimitProperties` (in-memory MVP; Redis optional later).
- [x] **Filter** — `AuthRateLimitFilter` on auth-sensitive routes (`/api/v1/auth/**` pattern per config); returns `429` `RATE_LIMITED` via `RestExceptionHandler`.
- [x] **Recovery** — `ForgotPasswordRateLimiter` per-email cooldown (complements global auth limits).
- [x] **Tests** — Auth/registration/recovery ITs assert rate limit behavior where applicable; configurable limits for tests.

## Change Log

- 2026-03-29: Retrospective story file.

## Dev Agent Record

### Completion Notes

- MVP uses **in-process** sliding windows; **Redis** can be swapped per `RateLimitProperties` / architecture follow-up.  
- Clients should read `error.code === RATE_LIMITED` and `traceId` for support.

### File List

- `astromatch-api/src/main/java/com/astromatch/api/config/AuthRateLimitFilter.java`
- `astromatch-api/src/main/java/com/astromatch/api/config/SlidingWindowRateLimiter.java`
- `astromatch-api/src/main/java/com/astromatch/api/config/RateLimitProperties.java`
- `astromatch-api/src/main/java/com/astromatch/api/config/SecurityConfiguration.java`
- `astromatch-api/src/main/java/com/astromatch/api/common/web/RestExceptionHandler.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/ForgotPasswordRateLimiter.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/RateLimitExceededException.java`
- `astromatch-api/src/main/resources/application.properties`
- `astromatch-api/src/test/java/com/astromatch/api/PasswordRecoveryIT.java`
- `astromatch-api/src/test/java/com/astromatch/api/AuthFlowIT.java`
- `astromatch-api/src/test/java/com/astromatch/api/RegistrationIT.java`
- `api-contract/openapi.yaml`
