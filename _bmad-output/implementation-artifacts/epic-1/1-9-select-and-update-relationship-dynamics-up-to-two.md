# Story 1.9: Select and update relationship dynamics (up to two)

Status: done

## Story

As a **registered user**,
I want **to choose up to two relationship dynamics from the eight MVP labels and change them later in settings**,
So that **my intent is reflected in the product** (FR11, FR12).

## Acceptance Criteria

**Given** the eight approved labels  
**When** I select dynamics during onboarding or settings  
**Then** at most two are active and limits beyond that show inline feedback  
**And** **DynamicPillSet** behaviors match UX-DR3 (accessibility, selection semantics).

**Maps:** FR11, FR12; UX-DR3.

## Tasks / Subtasks

- [x] **Catalog** — Eight MVP enum values server-side (`RelationshipDynamicsCatalog` / aligned strings); `PUT /api/v1/me/profile/dynamics` `{ labels: string[] }` max 2.
- [x] **Validation** — `ProfileService` rejects unknown labels and count > 2.
- [x] **Mobile** — `DYNAMIC_LABELS` in `profile-onboarding.ts`; toggle UI caps at two selections in `OnboardingFlow`.
- [x] **Tests** — `ProfileOnboardingIT`; OpenAPI `RelationshipDynamicLabel` enum.

## Change Log

- 2026-03-29: Retrospective story file.

## Dev Agent Record

### Completion Notes

- Labels are **stable string ids** (snake_case) for API and analytics.  
- Settings screen parity can reuse same API and client helpers.

### File List

- `astromatch-api/src/main/java/com/astromatch/api/profile/RelationshipDynamicsCatalog.java`
- `astromatch-api/src/main/java/com/astromatch/api/profile/MemberProfileController.java`
- `astromatch-api/src/main/java/com/astromatch/api/profile/ProfileService.java`
- `astromatch-api/src/test/java/com/astromatch/api/ProfileOnboardingIT.java`
- `astromatch-mobile/src/services/api-client/profile-onboarding.ts`
- `astromatch-mobile/src/features/onboarding/OnboardingFlow.tsx`
- `api-contract/openapi.yaml`
