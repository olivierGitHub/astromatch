# Story 6.2: Block a user and enforce non-interaction

Status: done

## Story

As a **registered user**,
I want **to block another user so we cannot interact**,
So that **I feel safe** (FR33).

## Acceptance Criteria

**Given** a target user  
**When** I block  
**Then** blocking prevents interaction per scoped rules (messages, likes—TBD)  
**And** unblock path exists where product requires.

**Maps:** FR33.

## Tasks / Subtasks

- [x] **API** — `user_blocks` table; `POST /api/v1/safety/block`, `DELETE /api/v1/safety/blocks/{blockedUserId}`, `GET /api/v1/safety/blocks`; bidirectional block checks in feed, matches list, swipe, messaging, feed photo access.
- [x] **Mobile** — Block from feed and chat; local list refresh after block.

## Change Log

- 2026-03-28: Initial implementation with Epic 6 batch.

## Dev Agent Record

### File List

- `astromatch-api/src/main/java/com/astromatch/api/safety/UserBlock*.java`
- `astromatch-api/src/main/java/com/astromatch/api/feed/FeedService.java`
- `astromatch-api/src/main/java/com/astromatch/api/match/MatchService.java`
- `astromatch-api/src/main/java/com/astromatch/api/match/MatchMessagingService.java`
