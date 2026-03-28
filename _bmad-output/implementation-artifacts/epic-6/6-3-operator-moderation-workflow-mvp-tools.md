# Story 6.3: Operator moderation workflow (MVP tools)

Status: done

## Story

As an **operator**,
I want **to review reported cases and apply warn/suspend/ban using MVP tools**,
So that **policy can be enforced** (FR32).

## Acceptance Criteria

**Given** a report queue (in-app minimal admin or external tool per PRD)  
**When** I review a case  
**Then** I can record outcome and apply actions that propagate to user state  
**And** audit basics exist (who/when/what) for accountability.

**Maps:** FR32.

## Tasks / Subtasks

- [x] **API** — `GET /api/v1/operator/reports` (open queue), `POST /api/v1/operator/reports/{id}/resolve` with `DISMISS|WARN|SUSPEND|BAN`; `X-Operator-Key` + `astromatch.operator.api-key`; `users.account_status`; `moderation_audit` rows.
- [x] **Enforcement** — `AccountStatusFilter` rejects API use for `SUSPENDED`/`BANNED` (403 `ACCOUNT_RESTRICTED`).

## Change Log

- 2026-03-28: Initial implementation with Epic 6 batch.

## Dev Agent Record

### File List

- `astromatch-api/src/main/java/com/astromatch/api/safety/OperatorController.java`
- `astromatch-api/src/main/java/com/astromatch/api/safety/OperatorAuthService.java`
- `astromatch-api/src/main/java/com/astromatch/api/config/AccountStatusFilter.java`
- `astromatch-api/src/main/java/com/astromatch/api/config/OperatorProperties.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/AccountStatus.java`
