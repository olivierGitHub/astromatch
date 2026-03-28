# Story 2.2: Session card hero with cosmic context and suggested dynamic

Status: done

## Story

As a **registered user**,
I want **a session card on each profile that explains cosmic context and suggested dynamic without raw rules**,
So that **I get meaning without a scoreboard** (FR16).

## Acceptance Criteria

**Given** a profile in the feed  
**When** I view the card  
**Then** **SessionCard** meets UX-DR2 (variants, states, contrast overlays, no deterministic language)  
**And** copy avoids percentage/score metaphors (FR14).

**Maps:** FR16; UX-DR2; UX-DR19 (motion subtle).

## Tasks / Subtasks

- [x] **API** — `cosmicContext` strings from `CosmicCopy` (non-numeric, non-rule-based); `suggestedDynamicKey` / `suggestedDynamicTitle` from member dynamics JSON.
- [x] **Mobile** — `SessionCard` hero, overlay pill for suggested dynamic, body copy for cosmic context; no score UI.
- [x] **Visual** — Contrast overlay on hero for pill readability.

## Change Log

- 2026-03-29: SessionCard UI + server copy fields on feed DTOs.

## Dev Agent Record

### Completion Notes

- Motion kept minimal (no extra animation libs) for UX-DR19 baseline; can add subtle transitions later.

### File List

- `astromatch-api/src/main/java/com/astromatch/api/feed/CosmicCopy.java`
- `astromatch-api/src/main/java/com/astromatch/api/feed/FeedService.java`
- `astromatch-mobile/src/features/feed/SessionCard.tsx`
- `api-contract/openapi.yaml`
