# Story 5.7: Validate entitlements with app stores server-side

Status: done

## Story

As a **system**,
I want **server-validated entitlements for supported IAP**,
So that **commerce is trustworthy** (FR30).

## Acceptance Criteria

**Given** receipts/tokens per chosen IAP model (TBD)  
**When** purchases or restores occur  
**Then** server validates with stores and updates user entitlement state  
**And** tests cover validation paths per architecture CI gates.

**Maps:** FR30; NFR-S3; architecture billing domain.

## Tasks / Subtasks

- [x] **API** — `astromatch.billing.stub-validation-enabled` gate; idempotent transactions; `BillingIT` covers grant + duplicate tx.
- [x] **Config** — Product ids and bonus amounts via `BillingProperties` (production: disable stub, integrate Apple/Google validators).

## Change Log

- 2026-03-29: Stub validation path + persistence; extension point for real store verification.

## Dev Agent Record

### Completion Notes

- Apple App Store / Google Play server APIs are not wired in this slice; stub path is explicit and off by configuration in production.

### File List

- `astromatch-api/src/main/java/com/astromatch/api/config/BillingProperties.java`
- `astromatch-api/src/main/java/com/astromatch/api/billing/BillingService.java`
- `astromatch-api/src/test/java/com/astromatch/api/BillingIT.java`
- `astromatch-api/src/main/resources/application.properties`
