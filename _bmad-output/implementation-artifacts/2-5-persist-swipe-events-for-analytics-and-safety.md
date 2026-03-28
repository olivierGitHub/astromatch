# Story 2.5: Persist swipe events for analytics and safety

Status: done

## Story

As a **system**,
I want **to record swipe events with privacy-minimized fields**,
So that **product behavior, safety, and calibration inputs exist** (FR41 swipe portion).

## Acceptance Criteria

**Given** swipe actions  
**When** events are recorded  
**Then** storage follows schema conventions (architecture naming) and excludes unnecessary PII  
**And** events are available for downstream matching/ops needs.

**Maps:** FR41 (swipes); NFR-S2.

## Tasks / Subtasks

- [x] **Schema** — Flyway `V8__swipe_events.sql`: `viewer_id`, `target_user_id`, `action`, `created_at`; unique `(viewer_id, target_user_id)` to prevent duplicate swipes.
- [x] **Entity** — `SwipeEvent` + `SwipeEventRepository`.
- [x] **Write path** — `FeedService.recordSwipe` persists after validation.

## Change Log

- 2026-03-29: swipe_events table and JPA persistence.

## Dev Agent Record

### Completion Notes

- No email or raw profile text stored on swipe row—only UUIDs + enum action + timestamp (NFR-S2).

### File List

- `astromatch-api/src/main/resources/db/migration/V8__swipe_events.sql`
- `astromatch-api/src/main/java/com/astromatch/api/feed/SwipeEvent.java`
- `astromatch-api/src/main/java/com/astromatch/api/feed/SwipeAction.java`
- `astromatch-api/src/main/java/com/astromatch/api/feed/SwipeEventRepository.java`
- `astromatch-api/src/main/java/com/astromatch/api/feed/FeedService.java`
