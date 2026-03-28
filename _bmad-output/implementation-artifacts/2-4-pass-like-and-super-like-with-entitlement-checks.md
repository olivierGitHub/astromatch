# Story 2.4: Pass, like, and super-like with entitlement checks

Status: done

## Story

As a **registered user**,
I want **to pass, like, and super-like when my entitlements allow**,
So that **I can engage with the feed** (FR18).

## Acceptance Criteria

**Given** feed cards and server-side entitlement state (stub or full from Epic 5 when integrated)  
**When** I take an action  
**Then** the client calls the API and handles disabled states (e.g. quota—integration point with Epic 5)  
**And** **SwipeActionDock** (UX-DR5) provides immediate feedback and clear labels.

**Maps:** FR18; UX-DR5; UX-DR10 (actions zone).

## Tasks / Subtasks

- [x] **API** — `POST /api/v1/feed/swipe` with `PASS` | `LIKE` | `SUPER_LIKE`; stub caps `astromatch.feed.daily-like-cap`, `daily-super-like-cap` (Epic 5 replaceable).
- [x] **Errors** — `403` + `QUOTA_EXCEEDED` when caps exceeded; traceId on errors.
- [x] **Mobile** — `SwipeActionDock` (Pass / Like / Super); `postFeedSwipe`; alerts for quota/rate-limit; remove card on success.

## Change Log

- 2026-03-29: Swipe endpoint, quotas, mobile dock.

## Dev Agent Record

### Completion Notes

- **PASS** does not consume like/super quota; **LIKE** and **SUPER_LIKE** tracked separately per UTC day.

### File List

- `astromatch-api/src/main/java/com/astromatch/api/config/FeedProperties.java`
- `astromatch-api/src/main/java/com/astromatch/api/feed/FeedController.java`
- `astromatch-api/src/main/java/com/astromatch/api/feed/FeedService.java`
- `astromatch-api/src/main/java/com/astromatch/api/common/web/RestExceptionHandler.java`
- `astromatch-api/src/main/resources/application.properties`
- `astromatch-mobile/src/features/feed/SwipeActionDock.tsx`
- `astromatch-mobile/src/features/feed/FeedScreen.tsx`
- `astromatch-mobile/src/services/api-client/feed.ts`
- `api-contract/openapi.yaml`
- `astromatch-api/src/test/java/com/astromatch/api/FeedQuotaIT.java`
