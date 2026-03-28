# Story 1.1: Initialize mobile and API projects with health check and design tokens

Status: done

<!-- Optional: run create-story validate workflow before bmad-dev-story -->

## Story

As a **new member**,
I want **the app and API to run locally with a visible health status and baseline visual tokens**,
So that **subsequent features ship on the architecture-approved stack with consistent UI foundations**.

## Acceptance Criteria

1. **Greenfield scaffolds** — Repo root (astromatch workspace) contains **`astromatch-mobile/`** (Expo + TypeScript) and **`astromatch-api/`** (Spring Boot + Maven) created using the commands and dependencies from [Source: `_bmad-output/planning-artifacts/architecture.md` § Starter Template Evaluation].
2. **API health** — Running the API locally exposes an HTTP health response suitable for CI/smoke checks: use **Spring Boot Actuator** `GET /actuator/health` (dependency already listed in Initializr curl) or an equivalent documented health endpoint; response must indicate **UP** when the app is running.
3. **OpenAPI contract stub** — **`api-contract/openapi.yaml`** (or `openapi/openapi.yaml` per architecture tree) defines a **minimal** OpenAPI 3.x document: `info`, `servers` (optional), and at least one path documenting the health check (can reference the same URL the mobile or curl will use for smoke tests).
4. **Design tokens (UX-DR1)** — Mobile app includes a **`design-system/`** (or `src/design-system/`) layer exporting **token objects** for:
   - **Color roles** — Cosmic Calm baseline: primary `#6C5CE7`, secondary `#14B8A6`, accent `#F59E0B`, background `#0F1020`, surface `#17192E`, text primary `#F8FAFC`, text muted `#AAB1C5` [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` § Visual Design Foundation → Color System].
   - **Spacing** — Base unit 8px; scale `4, 8, 12, 16, 24, 32, 40, 48` [Source: UX spec § Spacing & Layout Foundation].
   - **Radius** — primary `16`, secondary `12` [Source: UX spec § Spacing & Layout Foundation].
   - **Typography roles** — At minimum: font family Inter (and optional Space Grotesk for display), with line sizes for Display / H1–H3 / Body L/M / Caption per UX spec table [Source: UX spec § Typography System].
5. **Expo app runs** — `npx expo start` (or project’s documented command) launches without errors; a minimal screen may consume tokens (e.g. background + text color) to prove wiring.
6. **CI stubs** — `.github/workflows/` includes **workflow file(s)** that at least **lint or build** mobile and API on push/PR (jobs may be minimal; matrix optional). Naming aligned with architecture intent: e.g. `ci-mobile.yml`, `ci-api.yml`; **openapi-check** can be a no-op or validate YAML parses.
7. **Secrets** — `.env.example` files (or documented placeholders) for API and mobile; **no real secrets** in git; root `.gitignore` covers `*.env`, `local.properties`, `target/`, `node_modules/`, etc.

## Tasks / Subtasks

- [x] **Scaffold mobile** (AC: 1, 5, 7)  
  - [x] Run `npx create-expo-app@latest astromatch-mobile --template` from repo root [Source: architecture.md].  
  - [x] Add TypeScript strictness if template allows; ensure package name matches folder.  
  - [x] Commit-friendly `.gitignore` for Expo/Node.

- [x] **Scaffold API** (AC: 1, 2, 7)  
  - [x] Generate Spring Boot project via `start.spring.io` curl (dependencies: `web,data-jpa,validation,security,actuator,postgresql,flyway`) [Source: architecture.md].  
  - [x] Unzip into `astromatch-api/`, verify `./mvnw -q -DskipTests package` (or documented equivalent).  
  - [x] Confirm `management.endpoints.web.exposure.include=health` (or default) so `/actuator/health` works in dev profile.

- [x] **api-contract** (AC: 3)  
  - [x] Create `api-contract/README.md` one-liner: authoritative OpenAPI for REST integration.  
  - [x] Add minimal `openapi.yaml` with health path and shared `info.version` / title `astromatch-api`.

- [x] **Design tokens** (AC: 4)  
  - [x] Implement `tokens.ts` (or `tokens/colors.ts`, `spacing.ts` — keep one import surface for features).  
  - [x] Wire App entry to use background + textPrimary from tokens for a smoke UI.

- [x] **CI** (AC: 6)  
  - [x] Add GitHub Actions: e.g. API job runs `./mvnw verify` or compile; mobile runs `npm ci` + `npm run lint` if available or `npx expo export` skip if not configured — **must not silently pass empty workflow**; document if steps are placeholders.

- [x] **Documentation** (AC: 7)  
  - [x] Root `README.md`: how to run API (`./mvnw spring-boot:run`) and mobile (`npm install` / `npx expo start`), ports, health URL.

## Change Log

- 2026-03-28: Story 1.1 implemented — Expo + Spring Boot scaffolds, H2 bootstrap, actuator health + security permit, `ActuatorHealthIT`, `api-contract`, design tokens, CI workflows, root README and `.gitignore`.

## Dev Notes

### Architecture compliance (must follow)

- **Stack:** Java 21 + Spring Boot; React Native (Expo) + TypeScript [Source: architecture.md § Starter].  
- **Layout:** `astromatch-mobile/`, `astromatch-api/`, `api-contract/` at repo root [Source: architecture.md § Project Structure & Boundaries].  
- **Naming:** Java `PascalCase`/`camelCase`; mobile folders `kebab-case` where applicable; API JSON `camelCase` when endpoints are added later [Source: architecture.md § Implementation Patterns].  
- **Do not** add domain packages beyond a minimal `Application` + default package structure in this story; domain modules (`identity`, `profile`, …) come in later stories.  
- **Do not** wire PostgreSQL/Redis in this story unless required for app to start — Flyway/JPA can remain unused until Story 1.2+.

### UX compliance

- Tokens must match **Cosmic Calm** and **Inter** baseline per UX spec (see Acceptance Criteria).  
- Session card and full component library are **out of scope** for 1.1 — only foundational tokens.

### Testing

- **API:** Smoke test manually or JUnit that context loads and actuator health returns 200 (optional in CI).  
- **Mobile:** Manual launch + optional `npm test` if Expo template includes tests.

### Out of scope

- JWT, security filters beyond defaults, OpenAPI code generation, RDS, ECS, Redis, feature code.

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Debug Log References

- Spring Initializr returned 400 when `bootVersion=3.4.2` was pinned; resolved by omitting `bootVersion` (resolved to Spring Boot 4.0.5).
- Spring Boot 4 test classpath: used `java.net.http` + `@LocalServerPort` for health IT instead of `TestRestTemplate` / `AutoConfigureMockMvc` (packages differ in SB4).

### Completion Notes List

- `./mvnw verify` passes (includes `ActuatorHealthIT` + context test).
- `astromatch-mobile`: `npm run lint` (`tsc --noEmit`) passes.
- OpenAPI CI uses Python + PyYAML (Ruby not available locally).

### File List

- `README.md`
- `.gitignore`
- `.github/workflows/ci-api.yml`
- `.github/workflows/ci-mobile.yml`
- `.github/workflows/openapi-check.yml`
- `api-contract/README.md`
- `api-contract/openapi.yaml`
- `astromatch-mobile/` (Expo project, `App.tsx`, `package.json`, `package-lock.json`, `.env.example`)
- `astromatch-mobile/src/design-system/tokens.ts`
- `astromatch-mobile/src/design-system/index.ts`
- `astromatch-api/` (Spring Boot project: `pom.xml`, `mvnw`, source, tests)
- `astromatch-api/src/main/java/com/astromatch/api/config/SecurityConfiguration.java`
- `astromatch-api/src/main/resources/application.properties`
- `astromatch-api/src/test/java/com/astromatch/api/ActuatorHealthIT.java`
- `astromatch-api/.env.example`

---

## References

| Artifact | Path |
|----------|------|
| Epics / AC | `_bmad-output/planning-artifacts/epics.md` — Story 1.1 |
| Architecture | `_bmad-output/planning-artifacts/architecture.md` — Starters, structure, patterns |
| UX — tokens | `_bmad-output/planning-artifacts/ux-design-specification.md` — Visual Design Foundation |
| Sprint tracking | `_bmad-output/implementation-artifacts/sprint-status.yaml` |

---

### Senior Developer Review (AI)

**Outcome:** Approved — acceptance criteria satisfied; changes below are small hardening and consistency fixes applied during review.

**Review findings**

| Severity | Topic | Resolution |
|----------|--------|------------|
| Low | JPA open-in-view | Set `spring.jpa.open-in-view=false` in `application.properties`. |
| Low | Stateless API security intent | Javadoc on `SecurityConfiguration` notes CSRF disabled for stateless API; revisit for browser/cookie flows. |
| Low | Design token usage in UI | `App.tsx` uses `spacing.scale[3]` instead of a raw pixel literal for horizontal padding. |

**Deferred (not blocking)**

- Font families in tokens are names only; wire `expo-font` when a dedicated design-system or typography story lands.
- Default Spring Security user / generated dev password is acceptable for scaffold; replace when real auth is implemented.

**Verification (post-review)**

- `astromatch-api`: `./mvnw verify` — pass.
- `astromatch-mobile`: `npm run lint` (`tsc --noEmit`) — pass.

---

**Story context:** Ultimate context engine analysis completed — comprehensive developer guide for greenfield scaffold; no prior story in Epic 1.
