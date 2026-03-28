# Story 5.4: Purchase alignment boost with transparent scope

Status: done

## Story

As a **registered user**,
I want **to purchase alignment boost where eligible**,
So that **I understand extra visibility scope honestly** (FR27, UX-DR7).

## Acceptance Criteria

**Given** eligibility rules (within coherent dynamics)  
**When** I view and buy boost  
**Then** **BoostOfferCard** (UX-DR7) shows duration, price, disclosure—**no guaranteed match** language  
**And** post-purchase state is clear (active/cooldown/unavailable).

**Maps:** FR27; UX-DR7; UX-DR20.

## Tasks / Subtasks

- [x] **API** — `alignment_boost_until` on user; feed ordering uses opaque `mixWithBoost` while boost is active.
- [x] **Mobile** — Boost card in `BillingSheet` with non-guarantee disclosure; duration from server config (24h default).

## Change Log

- 2026-03-29: Boost grant + feed reorder hook in `FeedService.listCandidates`.

## Dev Agent Record

### File List

- `astromatch-api` — `User.alignmentBoostUntil`, `FeedService.mixWithBoost`
- `astromatch-mobile/src/features/billing/BillingSheet.tsx`
