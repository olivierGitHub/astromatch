# Story 6.1: Report a profile or user for abuse

Status: done

## Story

As a **registered user**,
I want **to report another user or profile for abuse or policy violations**,
So that **the community can be kept safe** (FR31).

## Acceptance Criteria

**Given** feed, profile, or chat contexts  
**When** I submit a report with required fields  
**Then** the report is stored for review and I get confirmation  
**And** rate limits apply to reports (FR42).

**Maps:** FR31; FR42.

## Tasks / Subtasks

- [x] **API** — `POST /api/v1/safety/report` with context `FEED|CHAT|MATCH`, reason code, optional detail; `user_reports` table; sliding-window rate limit per reporter per hour.
- [x] **Mobile** — Report flows from feed and chat (reason shortcuts).

## Change Log

- 2026-03-28: Initial implementation with Epic 6 batch.

## Dev Agent Record

### File List

- `astromatch-api/src/main/resources/db/migration/V12__safety_moderation.sql`
- `astromatch-api/src/main/java/com/astromatch/api/safety/*` (report entities, `SafetyService`, `SafetyController`)
- `astromatch-mobile/src/services/api-client/safety.ts`
- `astromatch-mobile/src/features/feed/FeedScreen.tsx`
- `astromatch-mobile/src/features/matches/ChatThreadScreen.tsx`
