# Story 5.2: Quota reached experience with non-mystical offers

Status: done

## Story

As a **registered user**,
I want **clear purchase options when I hit quota without mystical gimmicks**,
So that **I trust the paywall** (FR25, UX-DR6).

## Acceptance Criteria

**Given** zero daily swipes  
**When** I attempt to swipe  
**Then** **QuotaGatePanel** (UX-DR6) explains limits with concrete, honest copy  
**And** paths to shop, close, and restore (if applicable) are visible.

**Maps:** FR25; UX-DR6; UX-DR20.

## Tasks / Subtasks

- [x] **Mobile** — `QuotaGateModal` on `QUOTA_EXCEEDED`; See options → billing sheet; Restore purchases; Not now.
- [x] **Account** — “Purchases & limits” opens the same billing sheet.

## Change Log

- 2026-03-29: Quota gate + honest helper copy (no outcome guarantees).

## Dev Agent Record

### File List

- `astromatch-mobile/src/features/feed/QuotaGateModal.tsx`
- `astromatch-mobile/src/features/feed/FeedScreen.tsx`
- `astromatch-mobile/src/features/auth/HomeScreen.tsx`
