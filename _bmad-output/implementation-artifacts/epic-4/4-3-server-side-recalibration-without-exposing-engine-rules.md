# Story 4.3: Server-side recalibration without exposing engine rules

Status: done

## Story

As a **system**,
I want **to adjust what the user sees over time based on mismatch feedback**,
So that **relevance improves without showing raw matching logic** (FR23).

## Acceptance Criteria

**Given** stored mismatch signals  
**When** the user continues using the feed  
**Then** ordering/presentation changes are reflected **opaquely** (no editable rules in UI)  
**And** user-facing copy does not promise deterministic outcomes.

**Maps:** FR23.

## Tasks / Subtasks

- [x] **API** — Feed candidate sort: profiles with at least one mismatch event for `(viewer, target)` sort **after** profiles without; tie-break with existing opaque `mix` ordering.

## Change Log

- 2026-03-29: Comparator update in `FeedService.listCandidates`; integration test `mismatchDeprioritizesTargetInFeedOrdering`.

## Dev Agent Record

### Completion Notes

- No UI for rules or guarantees; mismatch sheet copy avoids promising a specific outcome.

### File List

- `astromatch-api/src/main/java/com/astromatch/api/feed/FeedService.java`
- `astromatch-api/src/test/java/com/astromatch/api/MismatchFeedbackIT.java`
