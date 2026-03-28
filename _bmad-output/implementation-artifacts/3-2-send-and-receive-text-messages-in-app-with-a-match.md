# Story 3.2: Send and receive text messages in-app with a match

Status: done

## Story

As a **registered user** who **mutually matched**,
I want **to exchange text messages inside the app**,
So that **we can coordinate without leaving astromatch** (FR20).

## Acceptance Criteria

**Given** an existing match  
**When** I open the thread and send/receive text  
**Then** messages persist, order is clear, and errors show send failures with retry  
**And** scope stays **text-only** for MVP (media/voice out of scope).

**Maps:** FR20; blocklist/report interactions deferred to Epic 6 where applicable.

## Tasks / Subtasks

- [x] **API** — `GET /api/v1/matches`, `GET/POST /api/v1/matches/{matchId}/messages`; persistence in `match_messages`.
- [x] **Mobile** — `MatchesScreen` list; `ChatThreadScreen` load/send with bubbles and composer; navigation from Discover tab and match modal.

## Change Log

- 2026-03-29: Matches list + chat thread wired in `HomeScreen` (Discover | Matches | Account).

## Dev Agent Record

### Completion Notes

- Errors surface inline in `ChatThreadScreen`; list retry on `MatchesScreen`.

### File List

- `astromatch-api` — `MatchController`, `MatchMessagingService`, Flyway `matches` / `match_messages`
- `astromatch-mobile/src/features/matches/MatchesScreen.tsx`
- `astromatch-mobile/src/features/matches/ChatThreadScreen.tsx`
- `astromatch-mobile/src/services/api-client/matches.ts`
- `astromatch-mobile/src/features/auth/HomeScreen.tsx`
