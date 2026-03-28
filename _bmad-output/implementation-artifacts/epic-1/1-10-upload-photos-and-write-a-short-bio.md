# Story 1.10: Upload photos and write a short bio

Status: done

## Story

As a **registered user**,
I want **to upload and manage profile photos and enter short free-text profile fields**,
So that **others see who I am within product limits** (FR38, FR39).

## Acceptance Criteria

**Given** authenticated profile  
**When** I add/remove/reorder photos within limits (count/size TBD)  
**Then** uploads validate size/type and errors are recoverable  
**When** I enter bio text within limits (TBD)  
**Then** content saves and truncates or validates per rules  
**And** least-privilege and no sensitive data in logs (NFR-S2).

**Maps:** FR38, FR39.

## Tasks / Subtasks

- [x] **Schema** — Flyway `V4`/`V6`/`V7` profile fields + `profile_photos` table; `ProfilePhoto` entity.
- [x] **API** — `PUT /api/v1/me/profile/bio`; `POST /api/v1/me/profile/photos` (multipart); `DELETE /api/v1/me/profile/photos/{photoId}`; `GET /api/v1/me/media/photos/{photoId}` for binary display.
- [x] **Config** — `UploadProperties` (size/type limits); storage under configurable media dir.
- [x] **Mobile** — `expo-image-picker` + `uploadProfilePhoto`; bio `TextInput` with max length aligned to server.
- [x] **Tests** — `ProfileOnboardingIT` where applicable; OpenAPI.

## Change Log

- 2026-03-29: Retrospective story file.

## Dev Agent Record

### Completion Notes

- **presentationComplete** in `MeResponse` reflects bio non-empty or ≥1 photo.  
- Media URLs require **authenticated** fetch or signed URL pattern in future hardening.

### File List

- `astromatch-api/src/main/resources/db/migration/V6__user_profile_fields.sql`
- `astromatch-api/src/main/resources/db/migration/V7__profile_photos.sql`
- `astromatch-api/src/main/java/com/astromatch/api/config/UploadProperties.java`
- `astromatch-api/src/main/java/com/astromatch/api/profile/ProfilePhoto.java`
- `astromatch-api/src/main/java/com/astromatch/api/profile/ProfilePhotoRepository.java`
- `astromatch-api/src/main/java/com/astromatch/api/profile/ProfilePhotoMediaController.java`
- `astromatch-api/src/main/java/com/astromatch/api/profile/MemberProfileController.java`
- `astromatch-api/src/main/java/com/astromatch/api/profile/ProfileService.java`
- `astromatch-api/src/test/java/com/astromatch/api/ProfileOnboardingIT.java`
- `astromatch-mobile/src/features/onboarding/OnboardingFlow.tsx`
- `astromatch-mobile/src/services/api-client/profile-onboarding.ts`
- `api-contract/openapi.yaml`
