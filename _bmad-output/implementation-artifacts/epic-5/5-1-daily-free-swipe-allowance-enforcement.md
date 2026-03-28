# Story 5.1: Daily free swipe allowance enforcement

Status: done

## Story

As a **registered user**,
I want **a daily free swipe allowance**,
So that **I understand fair use before paying** (FR24).

## Acceptance Criteria

**Given** product-configured allowance (amount TBD)  
**When** I swipe  
**Then** remaining allowance is tracked server-side and reflected in UI  
**And** hitting zero routes to quota experience (Story 5.2).

**Maps:** FR24.

## Tasks / Subtasks

- [x] **API** — `GET /api/v1/feed/quota` exposes remaining daily likes/supers, caps, and bonus like credits.
- [x] **Mobile** — Discover shows a compact quota line; swipe responses include `bonusLikeCreditsRemaining`.

## Change Log

- 2026-03-29: Feed quota endpoint + UI line on `FeedScreen`.

## Dev Agent Record

### File List

- `astromatch-api` — `FeedService.getQuota`, `FeedController` `/feed/quota`, `FeedDtos.FeedQuotaSnapshot`
- `astromatch-mobile/src/services/api-client/feed.ts`
- `astromatch-mobile/src/features/feed/FeedScreen.tsx`
