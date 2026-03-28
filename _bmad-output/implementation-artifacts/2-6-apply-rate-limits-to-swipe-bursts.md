# Story 2.6: Apply rate limits to swipe bursts

Status: done

## Story

As a **system**,
I want **limits on rapid swipe bursts**,
So that **abuse and automation are mitigated** (FR42 swipe scope).

## Acceptance Criteria

**Given** configured thresholds  
**When** swipe rate exceeds limits  
**Then** the user receives a clear message and recovery path  
**And** traceId is present for support.

**Maps:** FR42; architecture rate limiting.

## Tasks / Subtasks

- [x] **Limiter** — Reuse `SlidingWindowRateLimiter` with key `swipe:{viewerId}` and `astromatch.feed.swipe-burst-per-minute-per-user` (rolling 60s window).
- [x] **Error** — `429` + `RATE_LIMITED` via existing `RateLimitExceededException` / `RestExceptionHandler`.
- [x] **Mobile** — Alert “Slow down” with message + traceId when `RATE_LIMITED`.
- [x] **Tests** — `FeedBurstIT` with `swipe-burst-per-minute-per-user=2`.

## Change Log

- 2026-03-29: Burst limit in `FeedService.recordSwipe`; IT coverage.

## Dev Agent Record

### Completion Notes

- Per-**user** burst (not only IP), since swipes require JWT; complements Epic 1 IP auth limits.

### File List

- `astromatch-api/src/main/java/com/astromatch/api/feed/FeedService.java`
- `astromatch-api/src/main/java/com/astromatch/api/config/FeedProperties.java`
- `astromatch-api/src/main/java/com/astromatch/api/config/SlidingWindowRateLimiter.java`
- `astromatch-api/src/main/resources/application.properties`
- `astromatch-mobile/src/features/feed/FeedScreen.tsx`
- `astromatch-api/src/test/java/com/astromatch/api/FeedBurstIT.java`
