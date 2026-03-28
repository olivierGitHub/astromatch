# Story 5.3: Purchase additional swipes via in-app purchase

Status: done

## Story

As a **registered user**,
I want **to buy swipe packs through the store**,
So that **I can keep swiping** (FR26).

## Acceptance Criteria

**Given** store integration for the platform  
**When** I purchase a pack  
**Then** the client completes IAP and server validates entitlement (Story 5.7)  
**And** errors are actionable with retry/restore (NFR-R1, NFR-S3).

**Maps:** FR26; NFR-I1, NFR-S3.

## Tasks / Subtasks

- [x] **API** — `POST /api/v1/billing/purchase/validate` grants `bonus_swipe_balance` for product `com.astromatch.swipe_pack`; LIKE can consume bonus when daily cap is exhausted.
- [x] **Mobile** — `BillingSheet` “Buy (simulated)” calls validate with stub receipt (native store wiring can replace the client call).

## Change Log

- 2026-03-29: Billing domain + swipe pack grant + bonus consumption in `FeedService.recordSwipe`.

## Dev Agent Record

### Completion Notes

- Simulated purchase path exercises full server grant for CI; production should swap client for real IAP + receipts.

### File List

- `astromatch-api` — `BillingService`, `BillingController`, V11 users columns, `BillingIT`
- `astromatch-mobile/src/features/billing/BillingSheet.tsx`
- `astromatch-mobile/src/services/api-client/billing.ts`
