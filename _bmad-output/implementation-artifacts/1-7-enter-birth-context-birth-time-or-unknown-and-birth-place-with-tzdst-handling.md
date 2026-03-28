# Story 1.7: Enter birth context, birth time or unknown, and birth place with TZ/DST handling

Status: done

## Story

As a **registered user**,
I want **to enter DOB, birth time or “unknown,” and birth place with searchable place selection**,
So that **the system can derive timezone/DST context without expert astro controls** (FR6–FR8, FR10).

## Acceptance Criteria

**Given** onboarding or profile edit  
**When** I enter date of birth, optional time or “unknown,” and select birth place via searchable control  
**Then** inputs validate inline and I can correct mistakes later  
**And** the server stores what is needed to derive **timezone/DST** context for matching (FR10) without exposing engine internals.

**Maps:** FR6, FR7, FR8, FR10; NFR-I3 (geocoding degradation: retry/manual if provider fails).

## Tasks / Subtasks

- [x] **Schema** — Flyway `V4__users_birth_and_onboarding.sql` (birth fields, onboarding flags); `User` entity updates.
- [x] **API** — `PUT /api/v1/me/profile/birth`, `GET /api/v1/places/search` (MVP stub list); `PlacesController`, `ProfileService.updateBirth`.
- [x] **Validation** — Birth place label + IANA `birthTimezone`; optional lat/lng; `birthTime` when not unknown.
- [x] **Mobile** — Birth step: unknown toggle, time, place search, timezone selection.
- [x] **Tests** — `ProfileOnboardingIT` birth path; `openapi.yaml` contract.

## Change Log

- 2026-03-29: Retrospective story file.

## Dev Agent Record

### Completion Notes

- Place search is a **stub** with deterministic filters; replaceable with geocoder later (NFR-I3).  
- Server stores **TZ id** for DST-aware downstream use without exposing engine rules.

### File List

- `astromatch-api/src/main/resources/db/migration/V4__users_birth_and_onboarding.sql`
- `astromatch-api/src/main/java/com/astromatch/api/identity/User.java`
- `astromatch-api/src/main/java/com/astromatch/api/profile/MemberProfileController.java`
- `astromatch-api/src/main/java/com/astromatch/api/profile/PlacesController.java`
- `astromatch-api/src/main/java/com/astromatch/api/profile/ProfileService.java`
- `astromatch-api/src/test/java/com/astromatch/api/ProfileOnboardingIT.java`
- `astromatch-mobile/src/features/onboarding/OnboardingFlow.tsx`
- `astromatch-mobile/src/services/api-client/profile-onboarding.ts`
- `api-contract/openapi.yaml`
