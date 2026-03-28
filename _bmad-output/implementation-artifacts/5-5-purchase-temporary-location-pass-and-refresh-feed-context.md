# Story 5.5: Purchase temporary location pass and refresh feed context

Status: done

## Story

As a **registered user**,
I want **a temporary location change with updated feed context**,
So that **I can explore another city/zone transparently** (FR28, UX-DR8).

## Acceptance Criteria

**Given** IAP for location pass  
**When** purchase completes and I pick destination  
**Then** feed context updates per rules and duration is visible  
**And** **LocationPassCard** (UX-DR8) semantics are clear.

**Maps:** FR28; UX-DR8; UX-DR20.

## Tasks / Subtasks

- [x] **API** — `location_pass_until` + `location_pass_label`; exposed on `GET /api/v1/feed/quota` for UI/banners.
- [x] **Mobile** — Destination `TextInput` required before purchase; honest copy (not a travel product).

## Change Log

- 2026-03-29: Location pass columns + validate body `destinationLabel`.

## Dev Agent Record

### Completion Notes

- Geo-filtered feed deferred; quota carries label + window for transparent UX.

### File List

- `astromatch-api` — `User` location pass fields, `BillingService` grant branch
- `astromatch-mobile/src/features/billing/BillingSheet.tsx`
