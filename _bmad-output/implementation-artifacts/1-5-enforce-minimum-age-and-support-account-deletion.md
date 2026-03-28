# Story 1.5: Enforce minimum age and support account deletion

Status: done

## Story

As a **registered user**,
I want **the product to enforce minimum age and let me delete my account permanently**,
So that **I meet policy requirements and can leave the service** (FR4, FR5).

## Acceptance Criteria

**Given** registration or profile birth data  
**When** age is below the configured minimum for the jurisdiction/product rule  
**Then** registration or continued use is blocked with a clear explanation  
**When** I request account deletion  
**Then** my account and associated profile data are removed or scheduled per policy, with confirmation and irreversibility where required  
**And** store/account deletion expectations (NFR-I1) are considered in copy and flow.

**Maps:** FR4, FR5; NFR-I1.

## Tasks / Subtasks

- [x] **Policy** — Configurable minimum age (`astromatch.identity.minimum-age-years`, default 18); `AgePolicyService` + `AgePolicyException` → `403` `AGE_REQUIREMENT_NOT_MET` on register when `birthDate` implies underage.
- [x] **Registration** — `RegisterRequest` includes `birthDate`; `RegistrationService` validates age before persist.
- [x] **Account deletion** — `DELETE /api/v1/account` (JWT); `AccountDeletionService` removes user data, refresh tokens, media files; `AccountController`.
- [x] **Tests** — `MinAgeAndAccountIT` (underage register, authenticated delete, 401 without token).

## Change Log

- 2026-03-29: Retrospective story file; aligns with implemented API + tests.

## Dev Agent Record

### Completion Notes

- Minimum age is evaluated from **birth date** at registration (UTC “today” vs birthday).  
- `DELETE /api/v1/account` is irreversible in MVP; no soft-delete queue unless required later.

### File List

- `astromatch-api/src/main/java/com/astromatch/api/config/IdentityPolicyProperties.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/AgePolicyService.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/AgePolicyException.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/RegisterRequest.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/RegistrationService.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/AccountController.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/AccountDeletionService.java`
- `astromatch-api/src/main/java/com/astromatch/api/common/web/RestExceptionHandler.java`
- `astromatch-api/src/main/java/com/astromatch/api/config/SecurityConfiguration.java`
- `astromatch-api/src/test/java/com/astromatch/api/MinAgeAndAccountIT.java`
- `api-contract/openapi.yaml`
- `astromatch-mobile/src/features/auth/RegisterScreen.tsx`
