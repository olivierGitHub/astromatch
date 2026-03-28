# Story 6.5: Rate limits on report and abuse-prone endpoints

Status: done

## Story

As a **system**,
I want **rate limits on report and abuse-prone endpoints**,
So that **safety features cannot be weaponized** (FR42).

## Acceptance Criteria

**Given** configured limits  
**When** abuse-prone endpoints are called  
**Then** throttling applies and responses align with existing rate-limit patterns (e.g. 429 `RATE_LIMITED`).

**Maps:** FR42.

## Tasks / Subtasks

- [x] **API** — `SlidingWindowRateLimiter` keys `report:{userId}` (hour window) and `block:{userId}` (24h window); `SafetyProperties` for caps; `SafetyIT` covers report + block paths.

## Change Log

- 2026-03-28: Initial implementation with Epic 6 batch.

## Dev Agent Record

### File List

- `astromatch-api/src/main/java/com/astromatch/api/config/SafetyProperties.java`
- `astromatch-api/src/main/java/com/astromatch/api/safety/SafetyService.java`
- `astromatch-api/src/main/resources/application.properties`
