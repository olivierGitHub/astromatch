# Story 1.8: Provide current location via device or manual city

Status: done

## Story

As a **registered user**,
I want **to set current location using device location or manual city when GPS is denied or unavailable**,
So that **feed context can work without punishing me for permissions** (FR9).

## Acceptance Criteria

**Given** onboarding or settings  
**When** I grant location permission  
**Then** current location is captured with clear consent  
**When** I deny permission or location fails  
**Then** I can enter/search a manual city and complete the flow without being stuck  
**And** UX treats manual path as first-class (UX spec).

**Maps:** FR9; UX-DR11 branch.

## Tasks / Subtasks

- [x] **API** — `PUT /api/v1/me/profile/location` with `label`, optional `lat`/`lng`, `manual` flag.
- [x] **Mobile** — `expo-location` for permission + coords when allowed; manual label path when `manual: true`.
- [x] **Persistence** — Stored on profile via `ProfileService.updateLocation`.
- [x] **Tests** — `ProfileOnboardingIT` location updates; OpenAPI.

## Change Log

- 2026-03-29: Retrospective story file.

## Dev Agent Record

### Completion Notes

- **Manual** vs **GPS** distinguished by `manual` so server/analytics can reason about confidence.  
- Coordinates are optional for manual city entry.

### File List

- `astromatch-api/src/main/java/com/astromatch/api/profile/MemberProfileController.java`
- `astromatch-api/src/main/java/com/astromatch/api/profile/ProfileService.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/User.java`
- `astromatch-api/src/test/java/com/astromatch/api/ProfileOnboardingIT.java`
- `astromatch-mobile/src/features/onboarding/OnboardingFlow.tsx`
- `astromatch-mobile/src/services/api-client/profile-onboarding.ts`
- `api-contract/openapi.yaml`
