# Story 2.3: Browse multiple photos with secondary locality cues

Status: done

## Story

As a **registered user**,
I want **to browse multiple photos and see distance/locality as secondary information**,
So that **I can orient geographically without it dominating the story** (FR15, FR17).

## Acceptance Criteria

**Given** a profile with photos and locality rules (TBD)  
**When** I swipe through media  
**Then** carousel/gallery behavior is accessible and performant  
**And** locality/distance appears **secondary** to session/dynamic signals per PRD.

**Maps:** FR15, FR17.

## Tasks / Subtasks

- [x] **API** — `GET /api/v1/feed/profiles/{ownerUserId}/photos/{photoId}` with JWT; only while profile is an unswiped feed target; `localityLine` on card (label text, secondary styling on client).
- [x] **Mobile** — Horizontal thumbnail carousel + main hero image; `Image` `uri` + `Authorization` header; accessibility labels on thumbs.
- [x] **Contract** — OpenAPI feed media path documented.

## Change Log

- 2026-03-29: Feed-scoped photo endpoint + SessionCard carousel.

## Dev Agent Record

### Completion Notes

- Exact km distance deferred (privacy/product); locality is human-readable line only.

### File List

- `astromatch-api/src/main/java/com/astromatch/api/feed/FeedProfileMediaController.java`
- `astromatch-api/src/main/java/com/astromatch/api/feed/FeedService.java` (`readFeedPhoto`, eligibility rules)
- `astromatch-mobile/src/features/feed/SessionCard.tsx`
- `astromatch-mobile/src/services/api-client/feed.ts` (`feedProfilePhotoUrl`)
- `api-contract/openapi.yaml`
