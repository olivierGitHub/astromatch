# Story 5.6: Restore purchases per store rules

Status: done

## Story

As a **registered user**,
I want **to restore prior purchases**,
So that **I recover entitlements on a new device or after issues** (FR29).

## Acceptance Criteria

**Given** store restore APIs  
**When** I trigger restore  
**Then** entitlements sync server-side and UI confirms outcome  
**And** failures offer support path (FR37 cross-link acceptable).

**Maps:** FR29; NFR-I1.

## Tasks / Subtasks

- [x] **API** — `POST /api/v1/billing/restore` processes items idempotently via `billing_transactions.store_transaction_id`.
- [x] **Mobile** — Restore in `BillingSheet` and `QuotaGateModal`; refresh feed quota after success.

## Change Log

- 2026-03-29: Restore endpoint + client calls.

## Dev Agent Record

### File List

- `astromatch-api` — `BillingService.restorePurchases`, `billing_transactions` table
- `astromatch-mobile/src/services/api-client/billing.ts`
- `astromatch-mobile/src/features/billing/BillingSheet.tsx`
- `astromatch-mobile/src/features/feed/FeedScreen.tsx`
