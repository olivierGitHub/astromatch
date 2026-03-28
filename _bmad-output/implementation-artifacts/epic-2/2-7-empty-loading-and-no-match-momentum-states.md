# Story 2.7: Empty, loading, and no-match momentum states

Status: done

## Story

As a **registered user**,
I want **skeletons while loading and supportive messaging when few/no candidates appear**,
So that **I keep courage and momentum** (UX-DR9, UX-DR13, UX-DR14).

## Acceptance Criteria

**Given** slow network or empty candidate sets  
**When** the feed loads or returns no cards  
**Then** skeletons and empty states explain what happened and next steps  
**And** **MatchMomentumState** (UX-DR9) tone is courage-building, not shaming.

**Maps:** UX-DR9, UX-DR13, UX-DR14; NFR-P1.

## Tasks / Subtasks

- [x] **Loading** — `FeedSkeleton` placeholder blocks (UX-DR13) while `fetchFeedCandidates` runs.
- [x] **Error** — Clear title/body + **Retry** (NFR-R1).
- [x] **Empty** — Courage-building copy + **Refresh** when `candidates` is empty after successful load.

## Change Log

- 2026-03-29: FeedScreen empty/error/skeleton states.

## Dev Agent Record

### Completion Notes

- Copy is intentionally non-shaming; ties to MatchMomentumState intent without a separate component name in code.

### File List

- `astromatch-mobile/src/features/feed/FeedScreen.tsx`
