# Story 1.2: Create an account with a supported sign-up method

Status: done

<!-- Optional: run validate-create-story checklist before bmad-dev-story -->

## Story

As a **guest**,
I want **to register using a supported authentication method**,
So that **I can become a member and access astromatch** (FR1).

## Acceptance Criteria

1. **MVP method** — Registration uses **email + password** as the supported MVP method (aligns with epics “e.g. email + password, unless product selects another”; no OAuth in this story unless explicitly pulled in).
2. **Server-side account** — Submitting valid data creates a **persisted user account** in the system of record with **unique email** enforced; password is **never** stored in plaintext (use a strong one-way hash — BCrypt via Spring Security crypto is the default choice for this stack).
3. **Validation & errors (NFR-R1)** — Invalid input or conflicts (e.g. email already registered) return responses that use the **architecture error envelope** with **actionable** `message` / `code` / `details` and **`traceId`**; the mobile client surfaces **field-level or form-level** errors inline (no silent failure).
4. **OpenAPI** — `api-contract/openapi.yaml` documents the registration contract (path, request/response schemas, error responses); CI contract checks remain meaningful (no undocumented REST shapes).
5. **Post-success navigation (UX-DR11 entry)** — After successful registration, the user is **not left on a dead end**: either **(A)** navigates to a **Sign in** screen (placeholder acceptable if Story 1.3 will complete auth), or **(B)** proceeds to the **next onboarding step** only if that step does not require a signed-in session yet — **default recommendation: (A)** with email pre-filled and a clear success affordance, so Story 1.3 owns JWT/session without duplicating token logic in 1.2.
6. **Security configuration** — `SecurityConfiguration` permits **unauthenticated** access to the **registration** (and health) endpoints; all other API rules stay consistent with Story 1.1 baseline.

## Tasks / Subtasks

- [x] **Data model & migration** (AC: 2)  
  - [x] Add Flyway migration(s) for an `identity` user store (e.g. `users` table: `id`, `email` unique, `password_hash`, `created_at` UTC; UUID `id` per architecture ID guidance).  
  - [x] Enable Flyway for the dev profile used locally (Story 1.1 had `spring.flyway.enabled=false` — turn on migrations where appropriate; keep H2/Postgres compatibility or document profile split).  
  - [x] JPA entity + repository under `com.astromatch.api.identity` (or equivalent package per architecture).

- [x] **Registration API** (AC: 2, 3, 4, 6)  
  - [x] `POST` endpoint (e.g. `/api/v1/auth/register` or RESTful `POST /api/v1/users` — pick one, document in OpenAPI, stay consistent with plural REST norms in architecture).  
  - [x] Request body: `email`, `password` (camelCase JSON).  
  - [x] Success envelope: `{ data: { userId, email }, meta: {}, error: null }` (adjust `meta` as needed; no raw framework bodies).  
  - [x] Map validation errors and duplicate email to error envelope with stable `code` values (e.g. `VALIDATION_ERROR`, `EMAIL_ALREADY_EXISTS`).  
  - [x] Global or controller advice: never return stack traces to clients; include `traceId` on errors.

- [x] **Tests** (AC: 2, 3)  
  - [x] Integration test: successful registration returns 201 + success envelope; duplicate email returns expected error envelope; invalid email/password policy returns 400-class with details.

- [x] **Mobile registration UI** (AC: 1, 3, 5)  
  - [x] Add `src/features/auth/` (and minimal navigation entry from `App.tsx` or a root navigator): email + password fields, submit, loading state, inline errors.  
  - [x] Use **design tokens** (`src/design-system/`) for colors, spacing, typography — match Cosmic Calm baseline from Story 1.1.  
  - [x] API client call via `src/services/api-client/` (typed fetch or thin wrapper; base URL from env per `.env.example`).  
  - [x] On success: navigate to **Sign in** placeholder screen or show clear CTA — document chosen path in completion notes.

- [x] **Contract & CI** (AC: 4)  
  - [x] Update `api-contract/openapi.yaml`; ensure `openapi-check` workflow still passes.

## Change Log

- 2026-03-28: Implemented Story 1.2 — Flyway `users` table, `POST /api/v1/auth/register`, envelopes + `TraceIdFilter`, `RegistrationIT`, mobile `RegisterScreen` → `SignInScreen` placeholder, OpenAPI 0.0.2.
- 2026-03-28: Code review batch fixes — `DataIntegrityViolationException` duplicate-email path, `AccessDeniedException` (403 `ACCESS_DENIED`), safe response parsing + network errors in `register.ts`, validation field path mapping on `RegisterScreen`.

### Review Findings

- [x] [Review][Patch] Map unique-constraint / race (`DataIntegrityViolationException` on `users.email`) to `EMAIL_ALREADY_EXISTS` (409) instead of generic 500 — [`RestExceptionHandler.java`](astromatch-api/src/main/java/com/astromatch/api/common/web/RestExceptionHandler.java) / service layer
- [x] [Review][Patch] Harden `register.ts`: try/catch around `res.json()`; surface non-JSON / empty body without mislabeling as generic network error — [`register.ts`](astromatch-mobile/src/services/api-client/register.ts)
- [x] [Review][Patch] Add `@ExceptionHandler` for `AccessDeniedException` (403 + envelope) or exclude security exceptions from the generic `Exception` handler — [`RestExceptionHandler.java`](astromatch-api/src/main/java/com/astromatch/api/common/web/RestExceptionHandler.java)
- [x] [Review][Patch] Map validation `details[].field` when Spring uses nested paths (e.g. suffix `email` / `password`) or show top-level validation message — [`RegisterScreen.tsx`](astromatch-mobile/src/features/auth/RegisterScreen.tsx)
- [x] [Review][Defer] Rate limiting on registration endpoint — deferred to Epic 1 / Story 1.11 (FR42 auth abuse path)
- [x] [Review][Defer] Remove Spring Boot default `UserDetailsService` / generated dev password warning — deferred to Story 1.3 (stateless JWT)

## Dev Notes

### Scope boundary with Story 1.3

- **JWT access + refresh**, authenticated requests, and sign-out are **Story 1.3**. This story **creates the account** and **registration UX** only.  
- **Do not** implement full token issuance here unless product explicitly merges scopes — if you only need “continue” UX, prefer **success → Sign in** to avoid duplicating 1.3.

### Architecture compliance (must follow)

- **Packages:** `identity` domain under `astromatch-api` with controller → service → repository layering [Source: `_bmad-output/planning-artifacts/architecture.md` § Structure Patterns, Requirements to Components Mapping].  
- **DB naming:** `snake_case` tables/columns; `uq_users_email` style unique indexes [Source: architecture.md § Naming Patterns].  
- **API JSON:** `camelCase`; success/error envelopes exactly as documented [Source: architecture.md § Format Patterns].  
- **Mobile:** feature code under `src/features/auth/`, API under `src/services/api-client/` [Source: architecture.md § Project Structure].  
- **Password policy:** define minimum length (e.g. ≥ 8) and document in OpenAPI + server validation; align with future auth stories.

### UX compliance

- **UX-DR11** onboarding journey starts after account; **UX-DR12** feedback patterns: success (inline or short confirmation) and actionable errors with retry/edit.  
- **UX-DR15:** touch targets ≥ 44×44 where applicable; readable contrast using tokens.

### Previous story intelligence (Story 1.1)

- Spring Boot **4.0.x**, Java **21**; `SecurityConfiguration` currently permits only `/actuator/health`; extend `requestMatchers` for registration path(s).  
- **H2** in-memory with `spring.flyway.enabled=false` — enabling Flyway may require compatible migrations and driver settings; verify `./mvnw verify` after changes.  
- `spring.jpa.open-in-view=false` is already set — keep.  
- Design tokens live in `astromatch-mobile/src/design-system/tokens.ts` — reuse, do not fork colors ad hoc.  
- Review notes: CSRF disabled for stateless API; default Spring Security user/password from scaffold should be **removed or unused** once real identity exists (track if still referenced).

### Testing standards

- **API:** JUnit + `@SpringBootTest` or slice tests + `MockMvc`/`WebTestClient` as consistent with existing `ActuatorHealthIT` style.  
- **Mobile:** `npm run lint` (`tsc --noEmit`) must pass; manual happy path for registration.

### References

| Artifact | Path |
|----------|------|
| Epics / AC | `_bmad-output/planning-artifacts/epics.md` — Story 1.2 |
| PRD | `_bmad-output/planning-artifacts/prd.md` — FR1 |
| Architecture | `_bmad-output/planning-artifacts/architecture.md` — envelopes, identity mapping, naming |
| UX | `_bmad-output/planning-artifacts/ux-design-specification.md` — UX-DR11, UX-DR12, foundations |
| Prior implementation | `_bmad-output/implementation-artifacts/epic-1/1-1-initialize-mobile-and-api-projects-with-health-check-and-design-tokens.md` |

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Debug Log References

- Flyway `flyway-database-h2` artifact not resolved on this environment; Flyway 11 + H2 works with `flyway-core` alone for local H2.
- Spring Boot 4: `UserDetailsServiceAutoConfiguration` package path changed from servlet; default in-memory user warning retained — address in Story 1.3 with stateless JWT / explicit security config.

### Completion Notes List

- **POST `/api/v1/auth/register`** with BCrypt `password_hash`, Flyway `V1__create_users_table.sql`, `spring.jpa.hibernate.ddl-auto=validate`, `spring.flyway.enabled=true`.
- **Envelopes:** `ApiEnvelope` / `ApiError`, `RestExceptionHandler` (`VALIDATION_ERROR`, `EMAIL_ALREADY_EXISTS`, `INTERNAL_ERROR`), `TraceIdFilter` + `X-Trace-Id`.
- **Security:** `permitAll` for register + health; CORS for `/api/**`; stateless session; form/basic HTTP auth disabled.
- **Mobile:** `RegisterScreen` → `SignInScreen` placeholder; `EXPO_PUBLIC_API_BASE_URL` in `.env.example` (unchanged key).
- **Tests:** `RegistrationIT` (201, 409, 400); `./mvnw verify` and `npm run lint` pass.

### File List

- `api-contract/openapi.yaml`
- `astromatch-api/src/main/java/com/astromatch/api/common/api/ApiEnvelope.java`
- `astromatch-api/src/main/java/com/astromatch/api/common/api/ApiError.java`
- `astromatch-api/src/main/java/com/astromatch/api/common/web/RestExceptionHandler.java`
- `astromatch-api/src/main/java/com/astromatch/api/common/web/TraceIdFilter.java`
- `astromatch-api/src/main/java/com/astromatch/api/config/CorsConfiguration.java`
- `astromatch-api/src/main/java/com/astromatch/api/config/IdentityBeansConfiguration.java`
- `astromatch-api/src/main/java/com/astromatch/api/config/SecurityConfiguration.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/EmailAlreadyExistsException.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/RegisterRequest.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/RegisterResponse.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/RegistrationController.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/RegistrationService.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/User.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/UserRepository.java`
- `astromatch-api/src/main/resources/application.properties`
- `astromatch-api/src/main/resources/db/migration/V1__create_users_table.sql`
- `astromatch-api/src/test/java/com/astromatch/api/RegistrationIT.java`
- `astromatch-mobile/App.tsx`
- `astromatch-mobile/src/features/auth/RegisterScreen.tsx`
- `astromatch-mobile/src/features/auth/SignInScreen.tsx`
- `astromatch-mobile/src/services/api-client/register.ts`
- `astromatch-mobile/src/services/api-client/types.ts`

---

**Story context:** Ultimate context engine analysis completed — comprehensive developer guide created for registration vertical slice (identity persistence + contract + mobile form) with explicit handoff to Story 1.3 for JWT/session.
