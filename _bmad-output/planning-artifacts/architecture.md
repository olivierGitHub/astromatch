---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
  - 5
  - 6
  - 7
  - 8
workflowType: 'architecture'
lastStep: 8
status: complete
completedAt: '2026-03-27'
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
project_name: 'astromatch'
user_name: 'Oliver'
date: '2026-03-27'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
The PRD defines 42 FRs spanning identity/account lifecycle, profile/astro inputs (E5), relationship dynamics intent, feed ordering/session presentation, engagement and messaging, mismatch feedback recalibration, monetization and entitlement validation, trust and safety operations, privacy/legal surfaces, notifications, support, media content, and system integrity controls. Architecturally, this implies a multi-domain platform with clear bounded contexts rather than a single monolith of features.

**Non-Functional Requirements:**
Architecture is strongly shaped by privacy/security of sensitive birth/location data, reliability of auth/feed/swipe/purchase paths, responsive interaction performance on mid-range mobile devices, scalability for growth, app-store integration correctness, and accessibility obligations. These are not secondary constraints; they drive core design choices in data boundaries, service decomposition, and operational controls.

**Scale & Complexity:**
The product is a mobile-first consumer platform with medium-to-high architectural complexity due to compliance-sensitive data, monetization correctness requirements, trust/safety needs, and behavior-driven matching loops.

- Primary domain: Mobile dating platform with astrology-based compatibility orchestration
- Complexity level: Medium-high
- Estimated architectural components: 10-14 major components/contexts (mobile clients, identity, profile/media, matching orchestration, feedback/recalibration, messaging, payments/entitlements, moderation, notifications, support/compliance, analytics/observability, shared platform services)

### Technical Constraints & Dependencies

- App-store ecosystem constraints (Apple/Google IAP, restore, policy compliance)
- Geocoding/place services dependency for birth/current location
- Push infrastructure dependency for match/message notifications
- Sensitive PII storage and processing constraints (birth data, location)
- Need for timezone/DST correctness in matching context derivation
- Offline-lite UX requirement with clear retry/recovery behavior
- Cross-platform parity constraints across iOS/Android interaction flows

### Cross-Cutting Concerns Identified

- Authentication/session integrity and account lifecycle governance
- Privacy, consent, deletion/export, and data minimization
- Payment entitlement correctness and failure recovery
- Trust and safety workflows (reporting, blocking, moderation actions)
- Observability and product analytics without sensitive data leakage
- Accessibility and responsive interaction standards across all surfaces
- Content/copy governance for trust (non-mystical monetization, non-deterministic compatibility language)

## Starter Template Evaluation

### Primary Technology Domain

Mobile-first full-stack product: native-like mobile clients plus backend API platform (matching, messaging, entitlement, moderation, notifications).

### Starter Options Considered

- Expo (React Native + TypeScript) for iOS/Android client foundation
- React Native CLI baseline (more manual setup, higher control)
- Backend starter options considered: Spring Boot baseline vs lighter Node-based alternatives
- Supabase-style managed backend accelerators (faster start, tighter platform coupling)

### Selected Starter: Dual Starter Strategy (Expo + Spring Boot)

**Rationale for Selection:**

- Matches PRD/UX requirements for rich mobile interaction and cross-platform parity
- Supports modular backend boundaries needed for matching, messaging, IAP, and trust/safety domains
- Keeps team velocity high while preserving architectural control for sensitive PII and compliance surfaces
- Aligns with themeable design system and component-driven UX implementation plan

**Initialization Commands:**

```bash
# Mobile app
npx create-expo-app@latest astromatch-mobile --template

# Backend API
curl https://start.spring.io/starter.zip \
  -d type=maven-project \
  -d language=java \
  -d bootVersion=latest \
  -d baseDir=astromatch-api \
  -d groupId=com.astromatch \
  -d artifactId=astromatch-api \
  -d name=astromatch-api \
  -d packageName=com.astromatch.api \
  -d dependencies=web,data-jpa,validation,security,actuator,postgresql,flyway \
  -o astromatch-api.zip
```

**Architectural Decisions Provided by Starters:**

**Language & Runtime:**
React Native client with TypeScript and backend on Java 21 + Spring Boot.

**Styling Solution:**
Expo/React Native baseline styling primitives; design-system token layer added on top per UX decisions.

**Build Tooling:**
Managed mobile build pipeline from Expo and Maven/Gradle-driven Spring Boot build flow for backend services.

**Testing Framework:**
Starter-provided baseline testing harnesses (unit/integration defaults) to extend with product-specific suites.

**Code Organization:**
Feature/module-oriented backend package structure (Spring modules by domain) and screen/component-oriented mobile structure aligned with UX component strategy.

**Development Experience:**
Hot reload, TypeScript tooling, lint/test defaults, and straightforward local development workflows for both client and API.

**Note:** Project initialization using these starter commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- Backend platform: Java Spring Boot
- Primary database: PostgreSQL
- Distributed/session cache: Redis
- Auth model: JWT access + refresh token lifecycle
- Authorization model: RBAC
- API style: REST-first with OpenAPI contract
- Mobile app stack: React Native
- Deployment baseline: AWS ECS + RDS + GitHub Actions CI/CD

**Important Decisions (Shape Architecture):**

- Encryption strategy (in transit, at rest, and field-level for sensitive data)
- State partition strategy on mobile (server state vs local state)
- Offline queue behavior for swipe and feedback actions
- Token/session revocation model and device session policies
- API error contract and versioning strategy

**Deferred Decisions (Post-MVP):**

- Multi-region active-active deployment
- Event streaming platform expansion
- Advanced cache topology and autoscaling policies
- Full zero-trust internal mesh controls

### Data Architecture

- Primary store: PostgreSQL (system-of-record for users, profiles, swipes, matches, entitlements, moderation records)
- Cache/session/perf layer: Redis (hot feed candidates, rate-limit counters, token/session metadata, short-lived computation cache)
- Data modeling approach: domain-bounded schema modules (identity, profile, matching, messaging, billing, trust-safety)
- Migration approach: versioned, forward-only migrations via Flyway
- PII handling: strict minimization, role-scoped access, encrypted fields for sensitive birth/location attributes

### Authentication & Security

- Authentication: JWT access tokens with refresh token rotation
- Authorization: RBAC with endpoint- and action-level policy enforcement
- Token security controls: refresh token reuse detection, per-device session binding, revocation/invalidation path
- Encryption baseline:
  - TLS in transit
  - encrypted storage at rest
  - field-level encryption for highly sensitive values where required
- API protection: rate limiting, abuse protection, secure headers, request validation and schema enforcement

### API & Communication Patterns

- API style: REST-first
- Contract: OpenAPI as authoritative API contract for mobile-backend integration
- Contract governance: CI blocks breaking API contract drift unless explicitly versioned and approved
- Backend framework: Java Spring Boot (modular architecture by domain)
- Error standard: consistent error envelope with stable codes and actionable client messages
- Versioning: explicit API versioning policy with backward-compatible rollout for mobile clients
- Inter-service communication: start modular monolith, split by domain pressure only when justified

### Frontend Architecture

- Client stack: React Native
- State strategy: explicit split between server state (API-backed) and local UI state (interaction/session-level)
- Routing: mobile-native route architecture with predictable deep-link handling
- Offline queue policy:
  - Queueable: swipe and mismatch feedback actions
  - Non-queueable: entitlement-changing purchase confirmation/finalization
- Performance guardrail: session-card and feed interaction paths have explicit p95 targets with degraded fallback rendering

### Infrastructure & Deployment

- Cloud: AWS
- Compute runtime: ECS for backend services
- Database: RDS PostgreSQL
- Caching: managed Redis service
- CI/CD: GitHub Actions (build, test, security checks, deploy)
- Environment model: isolated dev/staging/prod with strict secret management
- Observability baseline: centralized logs, metrics, traces, and alerting tied to critical user journeys

### Decision Impact Analysis

**Implementation Sequence:**

1. Backend foundation (Spring Boot modules + PostgreSQL + Flyway + Redis integration)
2. Auth/security baseline (JWT/refresh/RBAC/encryption controls)
3. REST/OpenAPI contract and governance setup
4. Mobile shell (routing + state split + core feed flow)
5. Offline queue + entitlement-sensitive flows
6. Deployment/CI hardening on ECS/RDS pipeline

**Cross-Component Dependencies:**

- JWT/refresh strategy impacts mobile session lifecycle, offline replay, and revocation checks
- OpenAPI governance controls backend/mobile integration drift
- Redis strategy influences feed latency, anti-abuse controls, and token/session validation performance
- Encryption/PII controls constrain schema design, logging, and observability redaction policy
- Mandatory quality gates in CI:
  - OpenAPI contract tests
  - token lifecycle tests (rotation, reuse detection, revocation)
  - entitlement/restore flow tests for purchases

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
Five major areas where AI agents could diverge and create integration conflicts: naming, structure, formats, communication, and process behavior.

### Naming Patterns

**Database Naming Conventions:**

- Tables: plural `snake_case` (`users`, `swipe_events`, `purchase_entitlements`)
- Columns: `snake_case` (`user_id`, `created_at`, `birth_time_unknown`)
- Foreign keys: `<entity>_id` (`profile_id`, `match_id`)
- Index names: `idx_<table>_<column>` (`idx_users_email`)
- Unique constraints: `uq_<table>_<column>` (`uq_users_email`)

**API Naming Conventions:**

- REST resources: plural nouns (`/users`, `/profiles`, `/matches`, `/entitlements`)
- Path params: `{resourceId}` style in OpenAPI, mapped consistently in controllers
- Query params: `camelCase` (`createdAfter`, `pageSize`, `sortBy`)
- Headers: standard HTTP casing; custom headers prefixed consistently (`X-Request-Id`)

**Code Naming Conventions:**

- Java classes/interfaces: `PascalCase` (`MatchService`, `EntitlementController`)
- Java methods/fields: `camelCase`
- React Native components: `PascalCase` (`SessionCard.tsx`)
- RN hooks/utilities: `camelCase` with semantic prefixes (`useFeedState`, `formatSessionContext`)
- Folder names: `kebab-case` by feature (`matching-engine`, `quota-gate`)

### Structure Patterns

**Project Organization:**

- Backend organized by domain modules: `identity`, `profile`, `matching`, `messaging`, `billing`, `trustsafety`, `notifications`
- Each backend domain follows layered structure: controller -> service -> repository -> mapper/validator
- Mobile organized by feature + shared platform layers: `features/*`, `components/*`, `state/*`, `services/*`, `design-system/*`

**File Structure Patterns:**

- Unit tests co-located with implementation files where practical
- Integration tests in dedicated suites (`/integration` backend, flow suites for mobile)
- API contract artifacts centralized under an `api-contract` location sourced from OpenAPI
- Configuration split by environment (`dev`, `staging`, `prod`) with strict secret externalization

### Format Patterns

**API Response Formats:**

- Success envelope: `{ data, meta, error: null }`
- Error envelope: `{ data: null, meta, error: { code, message, details, traceId } }`
- Never return raw framework exceptions directly to clients
- Pagination metadata standardized in `meta` (page, pageSize, total, hasNext)

**Data Exchange Formats:**

- JSON payload fields: `camelCase`
- Database fields: `snake_case`
- Date/time over APIs: ISO-8601 UTC strings
- IDs: UUID format unless explicitly documented otherwise
- Booleans: true/false only (no 0/1 boolean semantics in API payloads)

### Communication Patterns

**Event System Patterns:**

- Domain event names: dot notation, past tense (`user.created`, `swipe.recorded`, `entitlement.activated`)
- Event payload base fields required: `eventId`, `eventType`, `occurredAt`, `actorId` (if applicable), `traceId`
- Event versioning via explicit `eventVersion`

**State Management Patterns:**

- Mobile state split: server state (remote/cache/invalidation) vs local interaction state (UI/session/transient)
- No direct mutation of shared state objects
- Action naming convention in mobile: verb-first intent (`loadFeed`, `submitMismatchFeedback`, `restorePurchaseState`)

### Process Patterns

**Error Handling Patterns:**

- Distinguish user-facing recoverable errors vs technical/internal errors
- Every recoverable failure path must include a next action: retry, edit input, restore, or contact support
- Include `traceId` in backend error responses for supportability

**Loading State Patterns:**

- Consistent states for all async flows: `idle` -> `loading` -> `success` | `error`
- Loading indicators are local to context first, global only when necessary
- Retry behavior follows bounded attempts + user-visible fallback
- Offline queue sync status is explicit and non-blocking for queueable actions

### Enforcement Guidelines

**All AI Agents MUST:**

- Follow naming/format rules exactly across DB, API, backend, and mobile layers
- Implement API contracts from OpenAPI source-of-truth; no undocumented response shapes
- Preserve standard success/error envelopes and date/time format rules
- Respect offline queue boundaries (queueable: swipe/mismatch; non-queueable: purchase finalization)
- Include traceability fields (`traceId`) in backend error and event flows

**Pattern Enforcement:**

- PR checks validate OpenAPI drift, linting, test placement, and response schema conformity
- Contract tests required for critical endpoints before merge
- Pattern violations must be documented in PR notes with explicit remediation
- Pattern updates require architecture-doc update before implementation divergence

### Pattern Examples

**Good Examples:**

- `POST /swipe-events` returns `{ data: { swipeEventId, status }, meta, error: null }`
- DB table `purchase_entitlements` with column `user_id`, API field `userId`
- Backend error response includes `code`, `message`, and `traceId`
- Mobile mismatch submission queued offline and synced later with explicit status badge

**Anti-Patterns:**

- Returning raw `500` stack traces to mobile clients
- Mixing `snake_case` and `camelCase` within the same API response
- Creating feature folders by screen in one module and by domain in another
- Queueing purchase entitlement finalization offline
- Using inconsistent endpoint conventions (`/user`, `/users-list`, `/users`)

## Project Structure & Boundaries

### Requirements to Components Mapping

**FR category → primary location (conceptual):**

| Area | Backend module | Mobile area |
|------|----------------|-------------|
| Identity, sessions, RBAC | `astromatch-api/.../identity/` | `features/auth/`, `state/session/` |
| Profile, astro inputs, media | `.../profile/` | `features/profile/`, `features/onboarding/` |
| Feed, matching, swipes | `.../matching/` | `features/feed/`, `features/swipe/` |
| Mismatch feedback, recalibration | `.../matching/` (subdomain) | `features/feedback/` |
| Messaging | `.../messaging/` | `features/chat/` |
| Entitlements, IAP, restore | `.../billing/` | `features/billing/`, platform bridges |
| Trust, safety, moderation | `.../trustsafety/` | `features/safety/`, reporting flows |
| Notifications | `.../notifications/` | `services/push/`, OS integration |
| Privacy, legal, export/delete | cross-cutting in `.../identity/` + `.../profile/` + compliance package | `features/settings/`, `features/privacy/` |
| System health, integrity | `.../platform/` or root `config`, Actuator | `services/api-client/`, error surfaces |

Cross-cutting packages: `design-system/`, `services/api-client/`, `state/` (server vs local), `offline/` queue.

### Complete Project Directory Structure

Repository layout assumes one repo with mobile app, API, and shared API contract (adjust if you split repos; paths stay analogous).

```
astromatch/
├── README.md
├── .gitignore
├── .editorconfig
├── .github/
│   └── workflows/
│       ├── ci-mobile.yml
│       ├── ci-api.yml
│       ├── openapi-check.yml
│       └── deploy-ecs.yml
├── api-contract/
│   ├── README.md
│   ├── openapi/
│   │   ├── openapi.yaml              # merged or root spec
│   │   └── paths/                    # optional split by domain
│   └── scripts/
│       └── validate.sh
├── astromatch-api/
│   ├── pom.xml
│   ├── README.md
│   ├── Dockerfile
│   ├── .env.example
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/astromatch/api/
│   │   │   │   ├── AstromatchApiApplication.java
│   │   │   │   ├── config/           # Security, Redis, Jackson, OpenAPI beans
│   │   │   │   ├── common/         # Error envelope, traceId, pagination meta
│   │   │   │   ├── identity/       # Auth, refresh, RBAC, sessions
│   │   │   │   ├── profile/        # Profile, astro fields, geocoding integration
│   │   │   │   ├── matching/       # Feed, swipes, matches, mismatch feedback
│   │   │   │   ├── messaging/      # Threads, messages
│   │   │   │   ├── billing/        # Entitlements, IAP verification hooks
│   │   │   │   ├── trustsafety/    # Reports, blocks, moderation workflows
│   │   │   │   ├── notifications/  # Push registration, preferences
│   │   │   │   └── platform/       # Health, feature flags, internal ops (if needed)
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── application-dev.yml
│   │   │       └── db/migration/   # Flyway SQL (V1__, V2__, ...)
│   │   └── test/
│   │       ├── java/.../integration/
│   │       └── resources/
│   └── target/                     # build output (gitignored)
├── astromatch-mobile/
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── babel.config.js
│   ├── .env.example
│   ├── App.tsx
│   ├── src/
│   │   ├── navigation/             # Root stack, tabs, deep links
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── onboarding/
│   │   │   ├── feed/
│   │   │   ├── swipe/
│   │   │   ├── chat/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   ├── billing/
│   │   │   ├── feedback/
│   │   │   └── safety/
│   │   ├── components/           # Shared UI (non-feature-specific)
│   │   ├── design-system/        # Tokens, themes, primitives
│   │   ├── state/                # Server cache, local UI state factories
│   │   ├── services/
│   │   │   ├── api-client/       # OpenAPI-generated or hand-typed client
│   │   │   ├── auth/
│   │   │   └── push/
│   │   ├── offline/              # Queue, replay, sync status
│   │   └── utils/
│   └── assets/
├── infra/                         # optional: Terraform/CDK snippets, ECS task defs
│   └── README.md
└── docs/
    └── architecture.md            # optional link or copy from _bmad-output
```

### Architectural Boundaries

**API boundaries**

- Public REST surface is only through Spring MVC controllers under each domain package; no direct DB access from controllers.
- `api-contract/openapi.yaml` is the contract source; mobile and server generation/tests consume it.
- Authentication: all protected routes go through Spring Security filter chain + RBAC; refresh and login are isolated in `identity`.
- Billing: store verification and entitlement writes live only in `billing`; mobile never trusts client-only purchase state for server entitlements.

**Component boundaries (mobile)**

- Screens live under `features/*`; shared visuals in `components/` and `design-system/`.
- Server-backed data flows through `services/api-client` and `state/` (cache/invalidation); swipe and mismatch feedback go through `offline/` when needed.
- Navigation does not import feature internals across features; shared types live in a thin `types/` or colocated contracts.

**Service boundaries (backend)**

- Modular monolith: domains communicate via injected application services, not circular package deps.
- Cross-domain calls (e.g. matching → notifications) go through facades or domain events internal to the process (start simple; extract later if needed).

**Data boundaries**

- PostgreSQL: one logical database with schema-per-domain or table prefixes per Flyway module; migrations only forward.
- Redis: keys namespaced by domain (`matching:feed:{userId}`, `session:{deviceId}`, rate limits, etc.).
- PII-heavy columns isolated in tables with restricted repository access; logging redacts birth/location.

### Requirements to Structure Mapping

**Cross-cutting**

- JWT/refresh/RBAC: `identity` + `config/SecurityConfig` + `common` error handling.
- OpenAPI CI: `api-contract/` + `.github/workflows/openapi-check.yml` + generated clients/tests.
- Trace IDs: `common` response filters + mobile `api-client` interceptors.
- Offline queue: `astromatch-mobile/src/offline/` + `matching` replay endpoints.

### Integration Points

**Internal**

- Mobile ↔ API: HTTPS REST only; JSON per envelope patterns; version header or path as per versioning policy.
- Backend ↔ Redis/PostgreSQL: Spring Data + Redis template or Lettuce; connection config in `config/`.

**External**

- Apple/Google IAP verification, push providers, geocoding, email/support tools: integration classes per domain (`billing`, `notifications`, `profile`) behind interfaces for testing.

**Data flow (simplified)**

- User action → mobile feature → `api-client` (or `offline` queue) → API controller → service → repository → DB; side effects (push, events) from domain services or transactional outbox pattern if introduced later.

### File Organization Patterns

**Configuration**

- Backend: `application.yml` + profile-specific files; secrets from env/parameter store in deployed environments.
- Mobile: `app.json`, env via Expo config; no secrets in repo.

**Tests**

- API: unit tests beside classes; integration tests under `src/test/java/.../integration/` with Testcontainers where useful.
- Mobile: Jest/RNTL per feature; contract tests driven from OpenAPI.

**Assets**

- Mobile: `assets/` images/fonts; remote media URLs from profile/media APIs.

### Development Workflow Integration

- Local: Docker Compose optional for Postgres + Redis; Expo dev client for mobile; Spring Boot dev profile for API.
- Build: Maven package API; EAS or Expo build profiles for store binaries; GitHub Actions matrix for lint, test, OpenAPI, deploy to ECS.

### Deployment Structure

- Container image built from `astromatch-api/Dockerfile`; ECS task definition references image + env; RDS and Redis endpoints via config; migrations run as init job or pipeline step before traffic shift.

## Architecture Validation Results

### Coherence Validation

**Decision compatibility**

Stack choices are mutually compatible: React Native (Expo) + Spring Boot REST + PostgreSQL + Redis + JWT/RBAC + OpenAPI + ECS/RDS/GitHub Actions form a conventional, well-supported path. No conflicting dual sources of truth for API contracts if OpenAPI remains authoritative and CI enforces drift checks.

**Pattern consistency**

Naming and envelope rules align with Spring (Java) and JSON/mobile conventions (camelCase API, snake_case DB). Offline queue rules match billing sensitivity. RBAC and encryption posture align with PII-heavy domains.

**Structure alignment**

Domain packages (`identity`, `profile`, `matching`, etc.) map to PRD feature areas and mobile `features/*` slices, supporting modular monolith evolution and clear AI-agent boundaries.

### Requirements Coverage Validation

**Functional requirements (PRD categories)**

The PRD groups FRs under: Account & identity; Profile & astro inputs; Relationship intent; Feed, matching & ordering; Session card & presentation; Engagement & match; Mismatch feedback & calibration; Monetization & entitlements; Trust & safety; Privacy & legal; Notifications; Support; Content & media; System & integrity. Each category has a mapped backend module and/or mobile feature area in this document; cross-cutting items (privacy, integrity) are explicitly assigned to shared layers and governance (OpenAPI CI, logging redaction, rate limits).

**Non-functional requirements**

Security, scalability, integration, and reliability NFRs are addressed at architectural level (TLS, encryption layers, least-privilege access, horizontal scaling via ECS, Redis for hot paths, observability baseline). Several PRD NFRs still carry **TBD** numeric targets (FPS, p95, cold-start seconds, WCAG level); architecture supports them but **product/engineering must finalize thresholds** before acceptance criteria are testable.

### Implementation Readiness Validation

**Decision completeness**

Critical decisions are documented; version pinning for Spring Boot/Java is intentionally left to init-at-implementation time (`bootVersion=latest` pattern) with a note to lock versions in the first implementation story.

**Structure completeness**

Concrete repo layout, Flyway location, `api-contract/`, and CI workflow filenames give implementers and agents a single map. Optional `infra/` is acknowledged for IaC without blocking MVP.

**Pattern completeness**

Conflict-prone areas (naming, envelopes, offline vs purchase, events, loading states) have explicit rules and examples.

### Gap Analysis Results

**Important (non-blocking)**

- Lock Java/Spring/Expo major versions in repo when the first story scaffolds projects; document in README or `docs/`.
- Define API versioning mechanism in one place (path vs header) when the first breaking change approaches.
- Expand OpenAPI split strategy (`paths/` vs single file) when the spec grows.

**Nice-to-have**

- ADR folder for significant post-MVP forks (e.g. event bus extraction).
- Explicit diagram of token refresh sequence for mobile onboarding docs.

### Architecture Completeness Checklist

**Requirements analysis**

- [x] Project context analyzed; scale and constraints captured
- [x] Cross-cutting concerns mapped

**Architectural decisions**

- [x] Critical stack and integration decisions recorded
- [x] Data, auth, API, frontend, infra positions clear

**Implementation patterns**

- [x] Naming, format, communication, process patterns defined with examples

**Project structure**

- [x] Directory tree and boundaries documented
- [x] FR-category mapping to code locations present

### Architecture Readiness Assessment

**Overall status:** Ready to drive implementation (pending numeric NFR targets from PRD follow-up).

**Confidence level:** High for stack and boundaries; medium until performance/accessibility numbers are fixed.

**Key strengths**

- Single contract (OpenAPI) with CI governance; clear modular monolith; explicit mobile server/local/offline split; security and entitlement boundaries called out.

**Areas for future enhancement**

- Multi-region, event streaming, and advanced cache topologies were already deferred in core decisions; revisit when scale demands.

### Implementation Handoff

**AI agent guidelines**

Follow this document for stack, patterns, structure, and boundaries. Do not introduce alternate API shapes or naming schemes without updating the architecture and OpenAPI.

**First implementation priority**

Run the documented starters (`create-expo-app`, Spring Initializr curl), add `api-contract` and OpenAPI check workflow, then implement identity + health + contract smoke path before feature verticals.
