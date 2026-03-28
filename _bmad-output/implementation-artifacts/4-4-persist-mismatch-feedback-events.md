# Story 4.4: Persist mismatch feedback events

Status: done

## Story

As a **system**,
I want **to record mismatch feedback events with privacy minimization**,
So that **calibration and safety analytics are supported** (FR41 feedback portion).

## Acceptance Criteria

**Given** submitted mismatch feedback  
**When** events are written  
**Then** they align with the same event model discipline as swipe events (Epic 2)  
**And** PII is minimized (NFR-S2).

**Maps:** FR41 (feedback); ties to Story 2.5 conventions.

## Tasks / Subtasks

- [x] **DB** — `mismatch_feedback_events` (`viewer_id`, `target_user_id`, `focus`, `created_at`); FK to `users`.
- [x] **API** — Persist row per submission; no free-text note in schema.

## Change Log

- 2026-03-29: Flyway V10, `MismatchFeedbackEvent` entity, repository.

## Dev Agent Record

### Completion Notes

- Stores UUIDs + enum + timestamp only; aligns with swipe_events-style analytics rows without message content.

### File List

- `astromatch-api/src/main/resources/db/migration/V10__mismatch_feedback_events.sql`
- `astromatch-api/src/main/java/com/astromatch/api/feed/MismatchFeedbackEvent.java`
- `astromatch-api/src/main/java/com/astromatch/api/feed/MismatchFeedbackRepository.java`
- `astromatch-api/src/main/java/com/astromatch/api/feed/FeedController.java` (`POST /api/v1/feed/mismatch`)
