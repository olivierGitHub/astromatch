# Story 6.4: Help and contact support (account, data, billing)

Status: done

## Story

As a **registered user**,
I want **help and contact paths for account/data and billing issues**,
So that **I can resolve problems** (FR37).

## Acceptance Criteria

**Given** help entry points  
**When** I choose account/data vs billing  
**Then** I reach the correct channel placeholder (email, form—TBD)  
**And** errors from Epic 5 purchases link here as needed.

**Maps:** FR37; NFR-R1.

## Tasks / Subtasks

- [x] **API** — `GET /api/v1/help/channels` (public) returns grouped placeholder channels with mailto hints.
- [x] **Mobile** — Account tab “Help & support” screen loads channels and opens mailto links.

## Change Log

- 2026-03-28: Initial implementation with Epic 6 batch.

## Dev Agent Record

### File List

- `astromatch-api/src/main/java/com/astromatch/api/help/HelpController.java`
- `astromatch-mobile/src/features/help/HelpScreen.tsx`
- `astromatch-mobile/src/features/auth/HomeScreen.tsx`
