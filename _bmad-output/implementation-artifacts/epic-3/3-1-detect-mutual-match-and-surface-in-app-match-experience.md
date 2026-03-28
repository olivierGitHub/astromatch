# Story 3.1: Detect mutual match and surface in-app match experience

Status: done

## Story

As a **registered user**,
I want **to know when a mutual match happens**,
So that **I can celebrate and choose what to do next** (FR19).

## Acceptance Criteria

**Given** reciprocal likes  
**When** a match is created server-side  
**Then** the client shows a match moment/surface with clear CTAs (chat vs continue)  
**And** no silent failure (NFR-R1).

**Maps:** FR19; UX patterns (match handoff).

## Tasks / Subtasks

- [x] **API** — Swipe response includes optional `match` when a mutual match is created; `MatchService` creates row and returns payload.
- [x] **Mobile** — `MatchCelebrationModal` after swipe when `result.match` is present; **Keep exploring** vs **Say hello** (opens chat).

## Change Log

- 2026-03-29: Feed swipe `match` payload, celebration modal, chat handoff from `HomeScreen`.

## Dev Agent Record

### Completion Notes

- Modal copy stays non-prescriptive; chat opens the match thread via shared `chatMatchId` state in `HomeScreen`.

### File List

- `astromatch-api` — match domain, feed swipe integration, `MatchIT`
- `astromatch-mobile/src/features/feed/FeedScreen.tsx`
- `astromatch-mobile/src/features/feed/MatchCelebrationModal.tsx`
- `astromatch-mobile/src/features/auth/HomeScreen.tsx`
- `astromatch-mobile/src/services/api-client/feed.ts`
