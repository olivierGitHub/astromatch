# Story 1.6: View privacy notice and manage optional consents

Status: done

## Story

As a **guest or member**,
I want **to read how sensitive data is used and control optional consents**,
So that **I understand birth/location use and can opt in or out where required** (FR34, FR35).

## Acceptance Criteria

**Given** the privacy notice content approved by product/legal  
**When** I open the notice from onboarding or settings  
**Then** I see clear use of sensitive data (birth, location)  
**When** optional consents exist (notifications, analytics—list TBD)  
**Then** I can grant or withdraw them and the system persists choices  
**And** consents do not block core MVP path where not legally required.

**Maps:** FR34, FR35; UX-DR11 (privacy step).

## Tasks / Subtasks

- [x] **Backend** — `GET /api/v1/legal/privacy` static copy; `LegalController`.
- [x] **Consents** — Flyway `V5__user_consents.sql`; `GET/PUT /api/v1/me/consents` (`MemberProfileController`, `ProfileService`), keys `notifications`, `analytics`, `privacy_ack`; unknown keys rejected.
- [x] **Onboarding step** — Privacy text loaded in onboarding flow; consents saved before continuing.
- [x] **Tests** — Covered in `ProfileOnboardingIT` + contract in `openapi.yaml`.

## Change Log

- 2026-03-29: Retrospective story file; aligns with legal + consent endpoints and mobile onboarding.

## Dev Agent Record

### Completion Notes

- Privacy body is **MVP static** JSON until CMS/legal pipeline.  
- `privacy_ack` can gate onboarding completion server-side when profile requires it.

### File List

- `astromatch-api/src/main/java/com/astromatch/api/profile/LegalController.java`
- `astromatch-api/src/main/java/com/astromatch/api/profile/MemberProfileController.java`
- `astromatch-api/src/main/java/com/astromatch/api/profile/ProfileService.java`
- `astromatch-api/src/main/java/com/astromatch/api/profile/UserConsent.java`
- `astromatch-api/src/main/java/com/astromatch/api/profile/UserConsentKey.java`
- `astromatch-api/src/main/java/com/astromatch/api/profile/UserConsentRepository.java`
- `astromatch-api/src/main/resources/db/migration/V5__user_consents.sql`
- `astromatch-api/src/test/java/com/astromatch/api/ProfileOnboardingIT.java`
- `astromatch-mobile/src/features/onboarding/OnboardingFlow.tsx`
- `astromatch-mobile/src/services/api-client/profile-onboarding.ts`
- `api-contract/openapi.yaml`
