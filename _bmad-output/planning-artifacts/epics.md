---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
workflowType: epics-and-stories
lastStep: 4
status: complete
completedAt: '2026-03-27'
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
project_name: astromatch
user_name: Oliver
date: '2026-03-27'
---

# astromatch - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for astromatch, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

- **FR1:** A **guest** can create an account using an authentication method the product supports (**exact methods TBD** — e.g. email, OAuth).
- **FR2:** A **registered user** can sign in and sign out on a device they control.
- **FR3:** A **registered user** can recover access when credentials are lost (**flow TBD**).
- **FR4:** A **registered user** can permanently delete their account and associated profile data per policy.
- **FR5:** The **system** can enforce **minimum age** for registration per jurisdiction and product rules.
- **FR6:** A **registered user** can enter and update **date of birth**.
- **FR7:** A **registered user** can enter **birth time** or indicate **unknown birth time**.
- **FR8:** A **registered user** can enter **birth place** using a **searchable place** control and correct mistakes later.
- **FR9:** A **registered user** can enter **current location** via **device location** or **manual city** when location is unavailable or denied.
- **FR10:** The **system** can derive **timezone / DST** context from birth and location inputs without requiring expert astro controls at MVP.
- **FR11:** A **registered user** can select up to **two** **relationship dynamics** from the **eight** MVP labels as sought intent.
- **FR12:** A **registered user** can change sought dynamics later in settings (**limits TBD**).
- **FR13:** A **registered user** can view a **feed of candidate profiles** ordered by the product’s **matching engine** (**opaque** to the user).
- **FR14:** The **system** can ensure **no public numeric compatibility score** is shown in the MVP experience.
- **FR15:** A **registered user** can see **distance or locality** as **secondary** information relative to session and dynamic signals (**rules TBD**).
- **FR16:** A **registered user** can see a **session card** on each profile that communicates **cosmic context** and **suggested relationship dynamic** without exposing raw engine rules.
- **FR17:** A **registered user** can browse **multiple photos** on a profile when provided.
- **FR18:** A **registered user** can **pass**, **like**, and **super-like** (if enabled) on a profile subject to **entitlements** and limits.
- **FR19:** A **registered user** can be notified when a **mutual match** occurs with another user.
- **FR20:** A **registered user** who has **mutually matched** can **send and receive text messages** with that user **in the app** (MVP messaging scope: **text**; **media/voice TBD**).
- **FR21:** A **registered user** can indicate **“does not match me”** on a profile.
- **FR22:** A **registered user** can optionally specify whether the issue is **the shown dynamic** or the **profile in general**.
- **FR23:** The **system** can adjust **what is presented** to the user over time in response to mismatch feedback **without** exposing or editing raw matching logic in the UI.
- **FR24:** A **registered user** can consume a **daily free swipe allowance** (**amount TBD**).
- **FR25:** A **registered user** who hits **quota** can see **purchase options** that are **non-mystical** (no **cosmic** paywall gimmick).
- **FR26:** A **registered user** can purchase **additional swipes** via **in-app purchase** where allowed.
- **FR27:** A **registered user** can purchase **alignment boost** visibility subject to **eligibility** (**within coherent dynamics**).
- **FR28:** A **registered user** can purchase **temporary location change** (city/zone) and have **feed context** updated accordingly.
- **FR29:** A **registered user** can **restore** prior purchases per store rules.
- **FR30:** The **system** can **validate purchase entitlements** with **app stores** per supported **IAP** model (**receipt / server validation approach TBD**).
- **FR31:** A **registered user** can **report** another user or profile for abuse or policy violations.
- **FR32:** An **operator** can review reported cases and apply **warn / suspend / ban** using **MVP tools** (may be **manual** outside the app).
- **FR33:** A **registered user** can **block** another user; **blocked** users cannot **interact** with the blocker (**interaction scope TBD** — e.g. messages, likes).
- **FR34:** A **guest or user** can view a **privacy notice** describing use of sensitive data (e.g. birth, location).
- **FR35:** A **registered user** can grant or withdraw **optional consents** where required (e.g. notifications, analytics — **list TBD**).
- **FR36:** A **registered user** can receive **push notifications** for **matches** and **new messages** subject to OS permissions and user settings.
- **FR37:** A **registered user** can access **help** and **contact support** for **account/data** issues and **billing** issues (**channels TBD**).
- **FR38:** A **registered user** can upload and manage **profile photos** within limits (**count/size TBD**).
- **FR39:** A **registered user** can enter a **short bio** or free-text profile fields (**limits TBD**).
- **FR40:** The **system** can authenticate **client requests** for signed-in users (**token/session model TBD**).
- **FR41:** The **system** can persist **swipe and feedback events** for product behavior, safety, and **privacy-minimized** analytics.
- **FR42:** The **system** can apply **rate limits** on **abuse-prone actions** (e.g. login, swipe bursts, reports — **thresholds TBD**).

### NonFunctional Requirements

- **NFR-P1:** **Feed scrolling** (list + profile card) remains **usable** on **mid-range** devices representative of the target market (**FPS / jank targets TBD**).
- **NFR-P2:** **Cold start** to first usable signed-in screen meets an **upper bound** agreed with engineering (**seconds TBD** per platform).
- **NFR-P3:** Primary actions (**swipe, like, purchase**) complete or surface **clear** loading/error within **bounded latency** under **normal network** (**p95 TBD**).
- **NFR-S1:** **Birth data, location, and auth credentials** are protected **in transit** (TLS) and **at rest** using **industry-standard** controls (**detail TBD**).
- **NFR-S2:** **Least-privilege** data access server-side; **no** sensitive fields in default **client logs** or **analytics** payloads.
- **NFR-S3:** **IAP** handling meets **store** security expectations and aligns with **FR30**.
- **NFR-SC1:** Service architecture supports **order-of-magnitude** DAU growth from launch baseline **without** redesigning core user flows (**approach TBD**).
- **NFR-SC2:** **Evening / peak** usage patterns do not cause **system-wide** failure (**load strategy TBD**).
- **NFR-A1:** Core flows support **OS text scaling** and **readable contrast** on default themes (**WCAG level TBD**).
- **NFR-A2:** **Touch targets** and **gestures** meet **platform** HIG baselines (**audit TBD**).
- **NFR-I1:** **App Store / Play** flows (IAP, account, deletion) meet **documented** store requirements at release.
- **NFR-I2:** **Push** uses a **reliable** provider path; **failures** are **observable** (**monitoring TBD**).
- **NFR-I3:** **Place / geocoding** integrations **degrade gracefully** (retry, manual entry) when third-party services are impaired.
- **NFR-R1:** **Auth, feed, swipe, and purchase** paths return **actionable** errors—not silent failure.

### Additional Requirements

_From Architecture (technical implementation constraints and enablers):_

- **Greenfield starters:** Initialize **Expo (React Native + TypeScript)** mobile app and **Spring Boot (Java)** API via documented commands; **first implementation story** should be scaffold + repos layout.
- **Stack:** PostgreSQL (system of record), Redis (cache/session/rate limits), Flyway forward-only migrations, **JWT access + refresh** with rotation/reuse detection, **RBAC**, **TLS**, encryption at rest and field-level for sensitive data as required.
- **API:** REST-first, **OpenAPI** as authoritative contract; **CI blocks** breaking contract drift unless versioned/approved; consistent JSON **success/error envelopes** and **traceId** on errors.
- **Repository layout:** `astromatch-mobile/`, `astromatch-api/`, `api-contract/openapi.yaml`, `.github/workflows/` (mobile, API, OpenAPI check, deploy ECS).
- **Backend domain packages:** `identity`, `profile`, `matching`, `messaging`, `billing`, `trustsafety`, `notifications`, `common`, `config`.
- **Mobile:** Feature folders under `src/features/*`, `design-system/`, `services/api-client/`, `offline/` queue for **swipe + mismatch only** (not purchase finalization).
- **Deployment:** AWS **ECS** + **RDS** + managed Redis; **GitHub Actions** pipeline; environments dev/staging/prod with secret management.
- **Observability:** Centralized logs, metrics, traces; alerting on critical journeys; **no PII** in analytics/telemetry defaults.
- **CI quality gates:** OpenAPI contract tests; token lifecycle tests; entitlement/restore tests (per architecture validation).
- **Naming:** DB `snake_case`, API JSON `camelCase`, ISO-8601 UTC for datetimes; documented in architecture patterns.
- **Versioning:** Lock **Java/Spring/Expo** versions when scaffolding; align with architecture handoff.

### UX Design Requirements

_Actionable UX-DR items for implementation and story coverage (from UX specification):_

- **UX-DR1:** Implement **design tokens** (color roles including Cosmic Calm baseline, typography scale Inter + Space Grotesk rules, spacing 8px-based scale, radius 16/12, elevation, motion semantics) as the foundation for all screens.
- **UX-DR2:** Implement **SessionCard** (hero): anatomy (title, dynamic label, narrative, timing cue, chips), variants compact/standard/expanded, states loading/default/expanded/low-confidence/error, reduced-motion-safe transitions, contrast-safe overlays, max narrative length guardrails, no deterministic/score language.
- **UX-DR3:** Implement **DynamicPillSet**: eight MVP labels, max two selected, selectable vs read-only display modes, disabled/limit-reached feedback, accessibility (multi-select semantics, ≥44×44 targets).
- **UX-DR4:** Implement **MismatchSheet**: bottom sheet, reason selector (dynamic vs profile), optional note, submit/cancel, idle/submitting/success/error-retry, focus trap and escape/back, neutral copy.
- **UX-DR5:** Implement **SwipeActionDock**: pass/like/super-like, optional mismatch entry, enabled/disabled/quota-reached states, immediate feedback, haptic-safe alternatives, clear labels for icon-only controls.
- **UX-DR6:** Implement **QuotaGatePanel**: non-mystical copy, paths to shop/close/restore, first-hit vs repeated-hit variants where specified.
- **UX-DR7:** Implement **BoostOfferCard**: title, scope disclosure, duration, price, CTA; states available/active/cooldown/unavailable; no “guaranteed match” implication.
- **UX-DR8:** Implement **LocationPassCard**: destination summary, duration, price, CTA, post-purchase destination selection and feed refresh guidance.
- **UX-DR9:** Implement **MatchMomentumState**: supportive no-match / streak messaging with courage-building tone and next-step CTA; variants inline vs full.
- **UX-DR10:** **Feed-first navigation** with minimal top-level destinations; **bottom sheets/modals** for mismatch, quota, short confirmations; **back** preserves context across side flows.
- **UX-DR11:** **Onboarding flow** per journey diagram: account → birth → birth time unknown path → place search → location permission or manual city → up to two dynamics → privacy/consent → feed with **inline helper** for first session-card comprehension.
- **UX-DR12:** **Feedback patterns** standardized: success (inline + optional toast), error (actionable + retry/restore/support), warning (quota boundary), info (inline near decision point); supportive non-punitive tone.
- **UX-DR13:** **Loading states:** skeletons for feed/profile; context-local spinners; avoid full-screen blocking unless required.
- **UX-DR14:** **Empty states** must include what happened, why, and what to do next (including no-match encouragement).
- **UX-DR15:** **Accessibility:** target **WCAG 2.2 AA** (4.5:1 body, 3:1 large, no color-only status, focus order, screen reader labels, reduced motion, text scaling).
- **UX-DR16:** **Responsive breakpoints** implemented: mobile 320–767 (primary), tablet 768–1023, desktop 1024+ with mobile-first enhancement.
- **UX-DR17:** **Foundation components** themed (buttons, inputs, sheets, lists, toasts, avatars, etc.) per design system choice; **custom components** built on tokens (see UX-DR2–UX-DR9).
- **UX-DR18:** **Component governance:** Storybook/spec pages (or equivalent) for each custom component with states and edge cases; DoD includes responsive + a11y checks per component.
- **UX-DR19:** **Motion:** gliding transitions (subtle buckets), accent pulse only for meaningful states per hybrid direction; **not** constant visual noise.
- **UX-DR20:** **Monetization copy:** transparent, benefit-based, non-mystical across quota, shop, boost, and location pass (aligns with FR25–FR28).

### FR Coverage Map

| FR | Epic | Notes |
|----|------|--------|
| FR1 | Epic 1 | Sign up |
| FR2 | Epic 1 | Sign in / out |
| FR3 | Epic 1 | Account recovery |
| FR4 | Epic 1 | Account deletion |
| FR5 | Epic 1 | Minimum age enforcement |
| FR6–FR10 | Epic 1 | Birth / place / TZ·DST |
| FR11–FR12 | Epic 1 | Relationship dynamics |
| FR34 | Epic 1 | Privacy notice |
| FR35 | Epic 1 | Optional consents |
| FR38–FR39 | Epic 1 | Photos & bio |
| FR40 | Epic 1 | Authenticated API requests |
| FR13–FR18 | Epic 2 | Feed, session context, swipe actions |
| FR14 | Epic 2 | No public numeric score (product + UI enforcement) |
| FR15 | Epic 2 | Distance / locality secondary |
| FR16 | Epic 2 | Session card |
| FR17 | Epic 2 | Multi-photo browse |
| FR41 | Epic 2, Epic 4 | Swipe events (Epic 2); mismatch/feedback events (Epic 4) |
| FR19 | Epic 3 | Match notification |
| FR20 | Epic 3 | In-app messaging |
| FR36 | Epic 3 | Push for matches & messages |
| FR21–FR23 | Epic 4 | Mismatch feedback & opaque recalibration |
| FR24–FR30 | Epic 5 | Quota, IAP, boost, location pass, restore, server validation |
| FR31 | Epic 6 | Report |
| FR32 | Epic 6 | Operator moderation (MVP tools) |
| FR33 | Epic 6 | Block |
| FR37 | Epic 6 | Help & support |
| FR42 | Epic 1, Epic 2, Epic 6 | Rate limits: auth / swipes / reports (and other surfaces as scoped per story) |

**NFRs (cross-cutting by epic focus):** Performance targets (NFR-P1–P3) primarily Epics 1–2–5; security (NFR-S1–S3) Epics 1 & 5; scalability (NFR-SC1–SC2) platform stories within Epics 1–2; accessibility (NFR-A1–A2) Epics 1–2 especially; integration (NFR-I1–I3) Epics 1–3–5; reliability (NFR-R1) all epics touching auth, feed, purchase.

**UX-DRs (primary epic):** UX-DR1, UX-DR3, UX-DR11, UX-DR15–UX-DR18 → Epic 1; UX-DR2, UX-DR5, UX-DR9–UX-DR14, UX-DR19 → Epic 2; UX-DR10 (feed-first, sheets) → Epics 2–5; UX-DR4 → Epic 4; UX-DR6–UX-DR8, UX-DR20 → Epic 5.

**Architecture enablers:** Repository scaffold, OpenAPI, CI, and deployment stories roll into Epic 1 (first vertical slice) and supporting stories so the stack matches `_bmad-output/planning-artifacts/architecture.md` without a “tech-only” epic.

## Epic List

### Epic 1: Join astromatch and complete my intentional profile

Users can create and recover accounts, meet age and privacy expectations, enter birth and location context (including unknown birth time and manual city), choose up to two relationship dynamics, upload photos and bio, manage consents, and use the app as an authenticated member—including account deletion when they choose.

**FRs covered:** FR1–FR12, FR34–FR35, FR38–FR40, FR4–FR5, FR3, and the **auth/login** portion of **FR42** (rate limits).

**Primary UX-DRs:** UX-DR1, UX-DR3, UX-DR11, UX-DR15–UX-DR18.

---

### Epic 2: Discover people through the feed and swipe with clarity

Users see an opaque ordered feed with a session card and profile context (no public numeric score), secondary locality when rules allow, multi-photo browsing, and pass/like/super-like within entitlements—plus resilient loading, empty/no-match encouragement, and swipe event persistence for product and safety.

**FRs covered:** FR13–FR18, FR14–FR17, **FR41** (swipe-side events), **FR42** (swipe burst limits), **FR15**.

**Primary UX-DRs:** UX-DR2, UX-DR5, UX-DR9–UX-DR14, UX-DR19; UX-DR10 (feed-first, sheets entry).

---

### Epic 3: Connect when the feeling is mutual

Users get notified of mutual matches, open conversations, and exchange text messages in-app, with push notifications for matches and new messages subject to permissions and settings.

**FRs covered:** FR19–FR20, FR36.

**Primary UX-DRs:** Messaging and list patterns from UX spec (conversation-first, reliability cues); NFR-I2 where applicable.

---

### Epic 4: Calibrate the feed when someone does not feel like a match

Users can signal “does not match me,” optionally distinguish dynamic vs profile, and rely on opaque presentation shifts over time—without exposing engine rules—with feedback persisted under privacy-minimized analytics.

**FRs covered:** FR21–FR23, **FR41** (feedback events).

**Primary UX-DRs:** UX-DR4, UX-DR10 (mismatch as sheet); aligns with architecture **offline queue** for mismatch.

---

### Epic 5: Stay within fair limits and upgrade with transparent commerce

Users experience daily swipe allowance, clear non-mystical purchase paths, swipe packs, alignment boost, temporary location context change, restore purchases, and server-side entitlement validation aligned with stores.

**FRs covered:** FR24–FR30.

**Primary UX-DRs:** UX-DR6–UX-DR8, UX-DR20.

---

### Epic 6: Keep the community safe and get help when you need it

Users can report and block others within defined interaction scope; operators can review cases and apply MVP moderation actions; users can reach help for account, data, and billing issues.

**FRs covered:** FR31–FR33, FR32, FR37, **FR42** (report / abuse-prone limits as scoped).

**Primary UX-DRs:** Destructive/safety button hierarchy, confirmation patterns, error + recovery (UX consistency).

---

## Epic and story breakdown

---

## Epic 1: Join astromatch and complete my intentional profile

Users can create and recover accounts, meet age and privacy expectations, enter birth and location context (including unknown birth time and manual city), choose up to two relationship dynamics, upload photos and bio, manage consents, and use the app as an authenticated member—including account deletion when they choose.

### Story 1.1: Initialize mobile and API projects with health check and design tokens

As a **new member**,
I want **the app and API to run locally with a visible health status and baseline visual tokens**,
So that **subsequent features ship on the architecture-approved stack with consistent UI foundations**.

**Acceptance Criteria:**

**Given** no prior project code in the workspace  
**When** the team follows `architecture.md` starter commands and adds `api-contract/` with a minimal OpenAPI stub  
**Then** the Expo app launches, the Spring Boot service exposes a **health** (or root) endpoint, and shared **design tokens** (colors, spacing, typography roles per UX Cosmic Calm + Inter baseline) exist in the mobile design-system layer  
**And** CI can at least build/lint both sides (workflow stubs acceptable) and **no secrets** are committed.

**Maps:** Architecture starters; UX-DR1 (foundation); NFR-P2 groundwork.

---

### Story 1.2: Create an account with a supported sign-up method

As a **guest**,
I want **to register using a supported authentication method**,
So that **I can become a member and access astromatch** (FR1).

**Acceptance Criteria:**

**Given** the API and app from Story 1.1  
**When** I complete registration with the chosen MVP method (e.g. email + password, unless product selects another)  
**Then** my account is created server-side with validation errors surfaced in-line per UX form patterns  
**And** I am guided to sign-in or next onboarding step without dead ends.

**Maps:** FR1; UX-DR11 (entry); NFR-R1 for actionable errors.

---

### Story 1.3: Sign in, sign out, and authenticated API requests

As a **registered user**,
I want **to sign in and sign out and have my client use authenticated requests**,
So that **my session is secure and the system can treat me as signed-in** (FR2, FR40).

**Acceptance Criteria:**

**Given** a registered account  
**When** I sign in with valid credentials  
**Then** I receive tokens per architecture (JWT access + refresh pattern) and the client attaches credentials to protected calls  
**When** I sign out  
**Then** tokens are cleared locally and refresh stops  
**And** protected endpoints reject unauthenticated calls with the standard error envelope.

**Maps:** FR2, FR40; architecture auth; NFR-S1 transport baseline (TLS in deployed env).

---

### Story 1.4: Recover access when credentials are lost

As a **registered user**,
I want **to recover access if I lose my credentials**,
So that **I can regain my account** (FR3).

**Acceptance Criteria:**

**Given** account recovery is enabled for the MVP method  
**When** I start recovery and follow the flow (e.g. email link or code—exact UX TBD)  
**Then** I can set new credentials or regain access per policy  
**And** errors are actionable (retry, contact support) and rate limiting applies (ties to FR42 on auth).

**Maps:** FR3; FR42 (auth abuse path).

---

### Story 1.5: Enforce minimum age and support account deletion

As a **registered user**,
I want **the product to enforce minimum age and let me delete my account permanently**,
So that **I meet policy requirements and can leave the service** (FR4, FR5).

**Acceptance Criteria:**

**Given** registration or profile birth data  
**When** age is below the configured minimum for the jurisdiction/product rule  
**Then** registration or continued use is blocked with a clear explanation  
**When** I request account deletion  
**Then** my account and associated profile data are removed or scheduled per policy, with confirmation and irreversibility where required  
**And** store/account deletion expectations (NFR-I1) are considered in copy and flow.

**Maps:** FR4, FR5; NFR-I1.

---

### Story 1.6: View privacy notice and manage optional consents

As a **guest or member**,
I want **to read how sensitive data is used and control optional consents**,
So that **I understand birth/location use and can opt in or out where required** (FR34, FR35).

**Acceptance Criteria:**

**Given** the privacy notice content approved by product/legal  
**When** I open the notice from onboarding or settings  
**Then** I see clear use of sensitive data (birth, location)  
**When** optional consents exist (notifications, analytics—list TBD)  
**Then** I can grant or withdraw them and the system persists choices  
**And** consents do not block core MVP path where not legally required.

**Maps:** FR34, FR35; UX-DR11 (privacy step).

---

### Story 1.7: Enter birth context, birth time or unknown, and birth place with TZ/DST handling

As a **registered user**,
I want **to enter DOB, birth time or “unknown,” and birth place with searchable place selection**,
So that **the system can derive timezone/DST context without expert astro controls** (FR6–FR8, FR10).

**Acceptance Criteria:**

**Given** onboarding or profile edit  
**When** I enter date of birth, optional time or “unknown,” and select birth place via searchable control  
**Then** inputs validate inline and I can correct mistakes later  
**And** the server stores what is needed to derive **timezone/DST** context for matching (FR10) without exposing engine internals.

**Maps:** FR6, FR7, FR8, FR10; NFR-I3 (geocoding degradation: retry/manual if provider fails).

---

### Story 1.8: Provide current location via device or manual city

As a **registered user**,
I want **to set current location using device location or manual city when GPS is denied or unavailable**,
So that **feed context can work without punishing me for permissions** (FR9).

**Acceptance Criteria:**

**Given** onboarding or settings  
**When** I grant location permission  
**Then** current location is captured with clear consent  
**When** I deny permission or location fails  
**Then** I can enter/search a manual city and complete the flow without being stuck  
**And** UX treats manual path as first-class (UX spec).

**Maps:** FR9; UX-DR11 branch.

---

### Story 1.9: Select and update relationship dynamics (up to two)

As a **registered user**,
I want **to choose up to two relationship dynamics from the eight MVP labels and change them later in settings**,
So that **my intent is reflected in the product** (FR11, FR12).

**Acceptance Criteria:**

**Given** the eight approved labels  
**When** I select dynamics during onboarding or settings  
**Then** at most two are active and limits beyond that show inline feedback  
**And** **DynamicPillSet** behaviors match UX-DR3 (accessibility, selection semantics).

**Maps:** FR11, FR12; UX-DR3.

---

### Story 1.10: Upload photos and write a short bio

As a **registered user**,
I want **to upload and manage profile photos and enter short free-text profile fields**,
So that **others see who I am within product limits** (FR38, FR39).

**Acceptance Criteria:**

**Given** authenticated profile  
**When** I add/remove/reorder photos within limits (count/size TBD)  
**Then** uploads validate size/type and errors are recoverable  
**When** I enter bio text within limits (TBD)  
**Then** content saves and truncates or validates per rules  
**And** least-privilege and no sensitive data in logs (NFR-S2).

**Maps:** FR38, FR39.

---

### Story 1.11: Apply rate limits to authentication-sensitive endpoints

As a **system**,
I want **rate limits on login, recovery, and other abuse-prone auth actions**,
So that **credential stuffing and abuse are mitigated** (FR42, auth scope).

**Acceptance Criteria:**

**Given** deployed API with Redis or equivalent per architecture  
**When** auth endpoints exceed configured thresholds  
**Then** requests are throttled with actionable client messaging and traceId  
**And** limits are configurable per environment.

**Maps:** FR42; architecture Redis usage.

---

### Story 1.12: Onboarding navigation shell and accessibility baseline for core profile flows

As a **registered user**,
I want **a coherent onboarding path and accessible controls on profile steps**,
So that **I reach the feed-ready state without confusion** (UX-DR11, UX-DR15–UX-DR18).

**Acceptance Criteria:**

**Given** Stories 1.2–1.10 building blocks  
**When** I move through onboarding  
**Then** navigation matches feed-first principles (UX-DR10) with back preserving context  
**And** WCAG 2.2 AA targets are met for these screens (contrast, touch targets, scaling, reduced motion) as specified in UX.

**Maps:** UX-DR10, UX-DR11, UX-DR15–UX-DR18.

---

## Epic 2: Discover people through the feed and swipe with clarity

Users see an opaque ordered feed with a session card and profile context (no public numeric score), secondary locality when rules allow, multi-photo browsing, and pass/like/super-like within entitlements—plus resilient loading, empty/no-match encouragement, and swipe event persistence for product and safety.

### Story 2.1: Fetch an opaque ordered feed of candidate profiles

As a **registered user**,
I want **to see a feed of candidate profiles ordered by the matching engine without seeing how scores work**,
So that **I can review people the product believes fit my intent** (FR13).

**Acceptance Criteria:**

**Given** a completed profile from Epic 1  
**When** I open the feed  
**Then** I receive an ordered list/card flow from the API with **no numeric compatibility score** exposed (FR14 enforced at API + UI)  
**And** loading uses skeletons (UX-DR13) and errors are actionable (NFR-R1).

**Maps:** FR13, FR14; NFR-P1/P3 foundations.

---

### Story 2.2: Session card hero with cosmic context and suggested dynamic

As a **registered user**,
I want **a session card on each profile that explains cosmic context and suggested dynamic without raw rules**,
So that **I get meaning without a scoreboard** (FR16).

**Acceptance Criteria:**

**Given** a profile in the feed  
**When** I view the card  
**Then** **SessionCard** meets UX-DR2 (variants, states, contrast overlays, no deterministic language)  
**And** copy avoids percentage/score metaphors (FR14).

**Maps:** FR16; UX-DR2; UX-DR19 (motion subtle).

---

### Story 2.3: Browse multiple photos with secondary locality cues

As a **registered user**,
I want **to browse multiple photos and see distance/locality as secondary information**,
So that **I can orient geographically without it dominating the story** (FR15, FR17).

**Acceptance Criteria:**

**Given** a profile with photos and locality rules (TBD)  
**When** I swipe through media  
**Then** carousel/gallery behavior is accessible and performant  
**And** locality/distance appears **secondary** to session/dynamic signals per PRD.

**Maps:** FR15, FR17.

---

### Story 2.4: Pass, like, and super-like with entitlement checks

As a **registered user**,
I want **to pass, like, and super-like when my entitlements allow**,
So that **I can engage with the feed** (FR18).

**Acceptance Criteria:**

**Given** feed cards and server-side entitlement state (stub or full from Epic 5 when integrated)  
**When** I take an action  
**Then** the client calls the API and handles disabled states (e.g. quota—integration point with Epic 5)  
**And** **SwipeActionDock** (UX-DR5) provides immediate feedback and clear labels.

**Maps:** FR18; UX-DR5; UX-DR10 (actions zone).

---

### Story 2.5: Persist swipe events for analytics and safety

As a **system**,
I want **to record swipe events with privacy-minimized fields**,
So that **product behavior, safety, and calibration inputs exist** (FR41 swipe portion).

**Acceptance Criteria:**

**Given** swipe actions  
**When** events are recorded  
**Then** storage follows schema conventions (architecture naming) and excludes unnecessary PII  
**And** events are available for downstream matching/ops needs.

**Maps:** FR41 (swipes); NFR-S2.

---

### Story 2.6: Apply rate limits to swipe bursts

As a **system**,
I want **limits on rapid swipe bursts**,
So that **abuse and automation are mitigated** (FR42 swipe scope).

**Acceptance Criteria:**

**Given** configured thresholds  
**When** swipe rate exceeds limits  
**Then** the user receives a clear message and recovery path  
**And** traceId is present for support.

**Maps:** FR42; architecture rate limiting.

---

### Story 2.7: Empty, loading, and no-match momentum states

As a **registered user**,
I want **skeletons while loading and supportive messaging when few/no candidates appear**,
So that **I keep courage and momentum** (UX-DR9, UX-DR13, UX-DR14).

**Acceptance Criteria:**

**Given** slow network or empty candidate sets  
**When** the feed loads or returns no cards  
**Then** skeletons and empty states explain what happened and next steps  
**And** **MatchMomentumState** (UX-DR9) tone is courage-building, not shaming.

**Maps:** UX-DR9, UX-DR13, UX-DR14; NFR-P1.

---

## Epic 3: Connect when the feeling is mutual

Users get notified of mutual matches, open conversations, and exchange text messages in-app, with push notifications for matches and new messages subject to permissions and settings.

### Story 3.1: Detect mutual match and surface in-app match experience

As a **registered user**,
I want **to know when a mutual match happens**,
So that **I can celebrate and choose what to do next** (FR19).

**Acceptance Criteria:**

**Given** reciprocal likes  
**When** a match is created server-side  
**Then** the client shows a match moment/surface with clear CTAs (chat vs continue)  
**And** no silent failure (NFR-R1).

**Maps:** FR19; UX patterns (match handoff).

---

### Story 3.2: Send and receive text messages in-app with a match

As a **registered user** who **mutually matched**,
I want **to exchange text messages inside the app**,
So that **we can coordinate without leaving astromatch** (FR20).

**Acceptance Criteria:**

**Given** an existing match  
**When** I open the thread and send/receive text  
**Then** messages persist, order is clear, and errors show send failures with retry  
**And** scope stays **text-only** for MVP (media/voice out of scope).

**Maps:** FR20; blocklist/report interactions deferred to Epic 6 where applicable.

---

### Story 3.3: Push notifications for matches and new messages

As a **registered user**,
I want **push notifications for matches and new messages when I allow them**,
So that **I don’t miss important moments** (FR36).

**Acceptance Criteria:**

**Given** OS permission and user notification settings  
**When** a match or new message arrives  
**Then** a push is delivered via the chosen provider path  
**When** denied or disabled  
**Then** in-app surfaces still work and settings are respected  
**And** failures are observable (NFR-I2).

**Maps:** FR36; NFR-I2.

---

## Epic 4: Calibrate the feed when someone does not feel like a match

Users can signal “does not match me,” optionally distinguish dynamic vs profile, and rely on opaque presentation shifts over time—without exposing engine rules—with feedback persisted under privacy-minimized analytics.

### Story 4.1: “Does not match me” entry and mismatch sheet

As a **registered user**,
I want **to open a lightweight flow from a profile to say it doesn’t match me**,
So that **I can correct relevance without breaking swipe rhythm** (FR21, UX-DR4).

**Acceptance Criteria:**

**Given** a feed/profile card  
**When** I choose “doesn’t match me”  
**Then** **MismatchSheet** (UX-DR4) opens with focus trap, neutral copy, submit/cancel  
**And** offline queue can enqueue the action per architecture (swipe/mismatch queue).

**Maps:** FR21; UX-DR4; UX-DR10.

---

### Story 4.2: Capture mismatch reason — dynamic vs profile

As a **registered user**,
I want **to say whether the issue is the shown dynamic or the profile in general**,
So that **feedback is specific enough to help** (FR22).

**Acceptance Criteria:**

**Given** the mismatch sheet  
**When** I submit  
**Then** optional reason selection is stored  
**And** validation handles network failure with retry consistent with offline policy.

**Maps:** FR22.

---

### Story 4.3: Server-side recalibration without exposing engine rules

As a **system**,
I want **to adjust what the user sees over time based on mismatch feedback**,
So that **relevance improves without showing raw matching logic** (FR23).

**Acceptance Criteria:**

**Given** stored mismatch signals  
**When** the user continues using the feed  
**Then** ordering/presentation changes are reflected **opaquely** (no editable rules in UI)  
**And** user-facing copy does not promise deterministic outcomes.

**Maps:** FR23.

---

### Story 4.4: Persist mismatch feedback events

As a **system**,
I want **to record mismatch feedback events with privacy minimization**,
So that **calibration and safety analytics are supported** (FR41 feedback portion).

**Acceptance Criteria:**

**Given** submitted mismatch feedback  
**When** events are written  
**Then** they align with the same event model discipline as swipe events (Epic 2)  
**And** PII is minimized (NFR-S2).

**Maps:** FR41 (feedback); ties to Story 2.5 conventions.

---

## Epic 5: Stay within fair limits and upgrade with transparent commerce

Users experience daily swipe allowance, clear non-mystical purchase paths, swipe packs, alignment boost, temporary location context change, restore purchases, and server-side entitlement validation aligned with stores.

### Story 5.1: Daily free swipe allowance enforcement

As a **registered user**,
I want **a daily free swipe allowance**,
So that **I understand fair use before paying** (FR24).

**Acceptance Criteria:**

**Given** product-configured allowance (amount TBD)  
**When** I swipe  
**Then** remaining allowance is tracked server-side and reflected in UI  
**And** hitting zero routes to quota experience (Story 5.2).

**Maps:** FR24.

---

### Story 5.2: Quota reached experience with non-mystical offers

As a **registered user**,
I want **clear purchase options when I hit quota without mystical gimmicks**,
So that **I trust the paywall** (FR25, UX-DR6).

**Acceptance Criteria:**

**Given** zero daily swipes  
**When** I attempt to swipe  
**Then** **QuotaGatePanel** (UX-DR6) explains limits with concrete, honest copy  
**And** paths to shop, close, and restore (if applicable) are visible.

**Maps:** FR25; UX-DR6; UX-DR20.

---

### Story 5.3: Purchase additional swipes via in-app purchase

As a **registered user**,
I want **to buy swipe packs through the store**,
So that **I can keep swiping** (FR26).

**Acceptance Criteria:**

**Given** store integration for the platform  
**When** I purchase a pack  
**Then** the client completes IAP and server validates entitlement (Story 5.7)  
**And** errors are actionable with retry/restore (NFR-R1, NFR-S3).

**Maps:** FR26; NFR-I1, NFR-S3.

---

### Story 5.4: Purchase alignment boost with transparent scope

As a **registered user**,
I want **to purchase alignment boost where eligible**,
So that **I understand extra visibility scope honestly** (FR27, UX-DR7).

**Acceptance Criteria:**

**Given** eligibility rules (within coherent dynamics)  
**When** I view and buy boost  
**Then** **BoostOfferCard** (UX-DR7) shows duration, price, disclosure—**no guaranteed match** language  
**And** post-purchase state is clear (active/cooldown/unavailable).

**Maps:** FR27; UX-DR7; UX-DR20.

---

### Story 5.5: Purchase temporary location pass and refresh feed context

As a **registered user**,
I want **a temporary location change with updated feed context**,
So that **I can explore another city/zone transparently** (FR28, UX-DR8).

**Acceptance Criteria:**

**Given** IAP for location pass  
**When** purchase completes and I pick destination  
**Then** feed context updates per rules and duration is visible  
**And** **LocationPassCard** (UX-DR8) semantics are clear.

**Maps:** FR28; UX-DR8; UX-DR20.

---

### Story 5.6: Restore purchases per store rules

As a **registered user**,
I want **to restore prior purchases**,
So that **I recover entitlements on a new device or after issues** (FR29).

**Acceptance Criteria:**

**Given** store restore APIs  
**When** I trigger restore  
**Then** entitlements sync server-side and UI confirms outcome  
**And** failures offer support path (FR37 cross-link acceptable).

**Maps:** FR29; NFR-I1.

---

### Story 5.7: Validate entitlements with app stores server-side

As a **system**,
I want **server-validated entitlements for supported IAP**,
So that **commerce is trustworthy** (FR30).

**Acceptance Criteria:**

**Given** receipts/tokens per chosen IAP model (TBD)  
**When** purchases or restores occur  
**Then** server validates with stores and updates user entitlement state  
**And** tests cover validation paths per architecture CI gates.

**Maps:** FR30; NFR-S3; architecture billing domain.

---

## Epic 6: Keep the community safe and get help when you need it

Users can report and block others within defined interaction scope; operators can review cases and apply MVP moderation actions; users can reach help for account, data, and billing issues.

### Story 6.1: Report a profile or user for abuse

As a **registered user**,
I want **to report another user or profile for abuse or policy violations**,
So that **the community can be kept safe** (FR31).

**Acceptance Criteria:**

**Given** feed, profile, or chat contexts  
**When** I submit a report with required fields  
**Then** the report is stored for review and I get confirmation  
**And** rate limits apply to reports (FR42).

**Maps:** FR31; FR42; destructive action UX patterns.

---

### Story 6.2: Block a user and enforce non-interaction

As a **registered user**,
I want **to block another user so we cannot interact**,
So that **I feel safe** (FR33).

**Acceptance Criteria:**

**Given** a target user  
**When** I block  
**Then** blocking prevents interaction per scoped rules (messages, likes—TBD)  
**And** unblock path exists where product requires.

**Maps:** FR33; integrates with Epic 3 messaging where applicable.

---

### Story 6.3: Operator moderation workflow (MVP tools)

As an **operator**,
I want **to review reported cases and apply warn/suspend/ban using MVP tools**,
So that **policy can be enforced** (FR32).

**Acceptance Criteria:**

**Given** a report queue (in-app minimal admin or external tool per PRD)  
**When** I review a case  
**Then** I can record outcome and apply actions that propagate to user state  
**And** audit basics exist (who/when/what) for accountability.

**Maps:** FR32; may be manual/external with explicit interface contract.

---

### Story 6.4: Help and contact support (account, data, billing)

As a **registered user**,
I want **help and contact paths for account/data and billing issues**,
So that **I can resolve problems** (FR37).

**Acceptance Criteria:**

**Given** help entry points  
**When** I choose account/data vs billing  
**Then** I reach the correct channel placeholder (email, form—TBD)  
**And** errors from Epic 5 purchases link here as needed.

**Maps:** FR37; NFR-R1.

---

### Story 6.5: Rate limits on report and abuse-prone endpoints

As a **system**,
I want **limits on reports and related abuse-prone actions**,
So that **the system resists spam and harassment of the pipeline** (FR42 Epic 6 scope).

**Acceptance Criteria:**

**Given** configured thresholds  
**When** report submission exceeds limits  
**Then** the user sees throttling with actionable messaging  
**And** aligns with Epic 1/2 rate-limit patterns.

**Maps:** FR42.

---

### UX-DR coverage note

| UX-DR | Addressed in |
|-------|----------------|
| UX-DR1, UX-DR3, UX-DR11, UX-DR15–UX-DR18 | Epic 1 (Stories 1.1, 1.9, 1.12 + ACs across) |
| UX-DR2, UX-DR5, UX-DR9–UX-DR14, UX-DR19 | Epic 2 |
| UX-DR10 | Epics 1–5 (navigation/sheets ACs) |
| UX-DR4 | Epic 4 |
| UX-DR6–UX-DR8, UX-DR20 | Epic 5 |
| Destructive/safety patterns | Epic 6 |

---

## Final validation (Step 4)

_Validation performed against PRD FR1–FR42, NFR inventory, UX-DR1–UX-DR20, and `architecture.md`._

### 1. FR coverage

| Check | Result |
|-------|--------|
| FR1–FR42 each mapped to at least one story (via Maps lines or epic table) | **Pass** |
| Split FRs (FR41 swipe vs feedback, FR42 by surface) | **Pass** — called out in Stories 2.5, 4.4, 1.11, 2.6, 6.5 |

### 2. Architecture alignment

| Check | Result |
|-------|--------|
| Starter / scaffold in Epic 1 Story 1.1 (Expo + Spring + `api-contract` + health + tokens) | **Pass** — matches architecture handoff |
| Incremental data/model creation implied (no “all tables in Story 1.1”) | **Pass** — registration (1.2) is first user-data vertical slice |
| OpenAPI, JWT pattern, Redis rate limits, offline queue for mismatch | **Pass** — referenced in ACs where relevant |

### 3. Story quality and dependencies

| Check | Result |
|-------|--------|
| Stories use Given/When/Then/And with testable ACs | **Pass** |
| Within-epic order builds on earlier stories | **Pass** |
| Cross-epic: Epic 2 Story 2.4 references entitlements / Epic 5 | **Note** — ACs require **stub or permissive** entitlement behavior until Epic 5 ships; document explicitly in sprint planning so ordering is clear |

### 4. Epic independence (high level)

| Check | Result |
|-------|--------|
| Epics 1–2–4–6 do not require Epic 3 for core dating loop | **Pass** |
| Epic 5 required for real quota/IAP; Epic 2 swipe actions use stub until then | **Conditional pass** — same as 3.3; track as implementation sequencing risk |

### 5. NFRs

NFRs are not duplicated per story; they are addressed where FRs imply them (performance, security, integration). Numeric **TBD**s in PRD remain **product/engineering follow-up**, not blockers for story structure.

### Validation outcome

**READY FOR DEVELOPMENT** — with explicit **sprint ordering** for Epic 2 ↔ Epic 5 entitlement integration (stub vs full).

---

**Workflow status:** Create Epics and Stories — **complete** (Step 4 saved, `completedAt` in frontmatter).
