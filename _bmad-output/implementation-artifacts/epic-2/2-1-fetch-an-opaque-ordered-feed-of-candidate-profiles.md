# Story 2.1: Fetch an opaque ordered feed of candidate profiles

Status: done

## Story

As a **registered user**,
I want **to see a feed of candidate profiles ordered by the matching engine without seeing how scores work**,
So that **I can review people the product believes fit my intent** (FR13).

## Acceptance Criteria

**Given** a completed profile from Epic 1  
**When** I open the feed  
**Then** I receive an ordered list/card flow from the API with **no numeric compatibility score** exposed (FR14 enforced at API + UI)  
**And** loading uses skeletons (UX-DR13) and errors are actionable (NFR-R1).

**Maps:** FR13, FR14; NFR-P1/P3 foundations.

## Tasks / Subtasks

- [x] **API** — `GET /api/v1/feed/candidates` returns ordered cards with `cosmicContext`, dynamics title, locality line, bio preview, photos; ordering is opaque (viewer×candidate mix sort); excludes self, incomplete onboarding, and already-swiped targets.
- [x] **Contract** — OpenAPI `0.2.0` feed schemas; no `score` field anywhere.
- [x] **Mobile** — `FeedScreen` skeleton, `fetchFeedCandidates`, error + retry; `HomeScreen` shows Discover feed by default.
- [x] **Tests** — `FeedIT.feedReturnsOnboardedCandidatesWithoutScoreField`.

## Change Log

- 2026-03-29: Implemented feed candidates API, mobile skeleton + feed load, IT.

## Dev Agent Record

### Completion Notes

- Ordering is **not** a numeric engine score—stable pseudo-random sort from UUID mix per viewer.
- Empty feed is handled in Story 2.7 messaging on the client; API returns empty `candidates`.

### File List

- `astromatch-api/src/main/java/com/astromatch/api/feed/FeedController.java`
- `astromatch-api/src/main/java/com/astromatch/api/feed/FeedService.java`
- `astromatch-api/src/main/java/com/astromatch/api/feed/CosmicCopy.java`
- `astromatch-api/src/main/java/com/astromatch/api/feed/FeedDtos.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/UserRepository.java`
- `astromatch-mobile/src/features/feed/FeedScreen.tsx`
- `astromatch-mobile/src/services/api-client/feed.ts`
- `astromatch-mobile/src/features/auth/HomeScreen.tsx`
- `api-contract/openapi.yaml`
- `astromatch-api/src/test/java/com/astromatch/api/FeedIT.java`
