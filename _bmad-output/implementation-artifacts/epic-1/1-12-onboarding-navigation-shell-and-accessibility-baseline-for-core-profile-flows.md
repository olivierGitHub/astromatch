# Story 1.12: Onboarding navigation shell and accessibility baseline for core profile flows

Status: done

## Story

As a **registered user**,
I want **a coherent onboarding path and accessible controls on profile steps**,
So that **I reach the feed-ready state without confusion** (UX-DR11, UX-DR15–UX-DR18).

## Acceptance Criteria

**Given** Stories 1.2–1.10 building blocks  
**When** I move through onboarding  
**Then** navigation matches feed-first principles (UX-DR10) with back preserving context  
**And** WCAG 2.2 AA targets are met for these screens (contrast, touch targets, scaling, reduced motion) as specified in UX.

**Maps:** UX-DR10, UX-DR11, UX-DR15–UX-DR18.

## Tasks / Subtasks

- [x] **Shell** — `OnboardingFlow` step list: Privacy → Birth → Location → Dynamics → Profile → Finish; back/next; `completeOnboarding` + `MeResponse` flags for readiness.
- [x] **Design tokens** — `design-system/tokens.ts` (colors, spacing, typography, radius) for consistent touch targets and contrast baseline.
- [x] **API** — `POST /api/v1/me/onboarding/complete`; `GET /api/v1/auth/me` exposes `onboardingCompleted`, `*_Complete` flags.
- [x] **App routing** — `App.tsx` wires registration → onboarding → home based on session + me payload.
- [x] **A11y** — Prefer `Pressable`, labels on key controls, `accessibilityLabel` / `accessibilityHint` where added; full WCAG audit remains iterative.

## Change Log

- 2026-03-29: Retrospective story file.

## Dev Agent Record

### Completion Notes

- **Feed-first** after onboarding: home screen post-`onboardingCompleted`.  
- A11y is **baseline** (tokens + semantics on core actions); formal WCAG 2.2 AA audit can extend coverage.

### File List

- `astromatch-mobile/App.tsx`
- `astromatch-mobile/src/features/onboarding/OnboardingFlow.tsx`
- `astromatch-mobile/src/features/auth/HomeScreen.tsx`
- `astromatch-mobile/src/features/auth/RegisterScreen.tsx`
- `astromatch-mobile/src/design-system/tokens.ts`
- `astromatch-mobile/src/design-system/index.ts`
- `astromatch-mobile/src/services/api-client/me.ts`
- `astromatch-mobile/src/services/api-client/profile-onboarding.ts`
- `astromatch-api/src/main/java/com/astromatch/api/identity/MeResponse.java`
- `astromatch-api/src/main/java/com/astromatch/api/identity/AuthController.java`
- `astromatch-api/src/main/java/com/astromatch/api/profile/MemberProfileController.java`
- `astromatch-api/src/test/java/com/astromatch/api/ProfileOnboardingIT.java`
- `api-contract/openapi.yaml`
