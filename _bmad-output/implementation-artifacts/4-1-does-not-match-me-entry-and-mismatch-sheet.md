# Story 4.1: “Does not match me” entry and mismatch sheet

Status: done

## Story

As a **registered user**,
I want **to open a lightweight flow from a profile to say it doesn’t match me**,
So that **I can correct relevance without breaking swipe rhythm** (FR21, UX-DR4).

## Acceptance Criteria

**Given** a feed/profile card  
**When** I choose “doesn’t match me”  
**Then** **MismatchSheet** (UX-DR4) opens with focus trap, neutral copy, submit/cancel  
**And** offline queue can enqueue the action per architecture (swipe/mismatch queue).

**Maps:** FR21; UX-DR4; UX-DR10.

## Tasks / Subtasks

- [x] **Mobile** — `MismatchSheet` (modal / bottom sheet pattern), radio-style focus selection, cancel/submit, neutral copy.
- [x] **Mobile** — `SwipeActionDock` entry “Doesn’t match me”; `FeedScreen` wiring.
- [x] **Offline** — `enqueueMismatch` + `flushMismatchQueue` (`AsyncStorage`) aligned with architecture queue boundary.

## Change Log

- 2026-03-29: Mismatch sheet, dock entry, offline queue module.

## Dev Agent Record

### Completion Notes

- Focus trap approximated with modal + `accessibilityViewIsModal`; sheet dismiss via backdrop and Cancel.

### File List

- `astromatch-mobile/src/features/feed/MismatchSheet.tsx`
- `astromatch-mobile/src/features/feed/SwipeActionDock.tsx`
- `astromatch-mobile/src/features/feed/FeedScreen.tsx`
- `astromatch-mobile/src/services/offline/mismatch-queue.ts`
