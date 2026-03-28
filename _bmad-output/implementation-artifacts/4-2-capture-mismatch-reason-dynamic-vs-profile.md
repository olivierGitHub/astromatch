# Story 4.2: Capture mismatch reason — dynamic vs profile

Status: done

## Story

As a **registered user**,
I want **to say whether the issue is the shown dynamic or the profile in general**,
So that **feedback is specific enough to help** (FR22).

## Acceptance Criteria

**Given** the mismatch sheet  
**When** I submit  
**Then** optional reason selection is stored  
**And** validation handles network failure with retry consistent with offline policy.

**Maps:** FR22.

## Tasks / Subtasks

- [x] **API** — `MismatchFocus` enum (`DYNAMIC`, `PROFILE`, `UNSPECIFIED`) on `POST /api/v1/feed/mismatch`.
- [x] **Mobile** — Three labeled options in `MismatchSheet`; failed submit enqueues for later flush.

## Change Log

- 2026-03-29: Focus persisted on mismatch events; client/server types aligned.

## Dev Agent Record

### Completion Notes

- “Prefer not to say” maps to `UNSPECIFIED` to keep analytics structured without free-text PII.

### File List

- `astromatch-api` — `MismatchFocus`, `FeedDtos.MismatchRequest`, `FeedService.recordMismatchFeedback`
- `astromatch-mobile/src/features/feed/MismatchSheet.tsx`
- `astromatch-mobile/src/services/api-client/feed.ts`
