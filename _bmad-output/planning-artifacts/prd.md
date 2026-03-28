---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
inputDocuments:
  - "_bmad-output/brainstorming/brainstorming-session-2026-03-27-002226.md"
workflowType: prd
documentCounts:
  productBriefs: 0
  research: 0
  brainstorming: 1
  projectDocs: 0
projectClassification: greenfield
classification:
  projectType: mobile_app
  domain: general
  productVertical: consumer_dating
  complexity: medium
  projectContext: greenfield
  notes: "CSV domain=general; product vertical is consumer dating. Medium complexity for IAP, sensitive birth/location PII, store compliance, trust/safety. Party mode refinements accepted."
prd_workflow_completed: "2026-03-27"
---

# Product Requirements Document - astromatch

**Author:** Oliver
**Date:** 2026-03-27

## Executive Summary

**astromatch** is a **consumer mobile dating app** (Tinder-style discovery: profiles, mutual interest, chat) whose **matching engine is driven by astrology**, but **never sold as a percentage score**. The product targets people who want **dating that feels intentional**: they see **what kind of relationship dynamic** is suggested (e.g. romance, light, serious, adventure—**eight labeled dynamics** at MVP), plus a **“session card”** at the top of each profile: short **cosmic context** (mood, moon/season, “climate,” optional timing line)—**narrative and framing**, not a numeric rank.

The **real problem** is not “more profiles”—it is **opaque or gamey compatibility** on incumbents (endless swipes, vague intent, **compatibility as a gameable number**). **astromatch** answers with: **black-box ordering** (who appears, when), **relationship-first language**, and **feedback that recalibrates what is shown** (“this doesn’t match me”) **without exposing or editing raw algorithm logic**—a **product-level trust loop**, not a settings screen.

**MVP scope** (from discovery inputs): **onboarding** (birth data with optional unknown time, up to **two** chosen dynamics, current location), **feed** with dominant session card + actions (nope / super / like + optional mismatch feedback), **freemium** (daily swipe limit, packs, super swipe, **alignment boost**, paid **location change**), **E5** minimal astro inputs and **no** heavy astro glossary or advanced house/aspect controls at launch.

### What Makes This Special

1. **Signal model:** **Relationship dynamic** as the primary visible signal—not “% match.” **Distance** is secondary; **time window / “climate”** matter more for ordering and story.
2. **Black-box astrology:** The engine stays **non-explained** in depth; the UI delivers **meaning and legitimacy** through copy and layout, not formula disclosure.
3. **Session card as hero:** Large top-of-profile **session card** (“weather-style”) carrying **cosmic garnish + suggested dynamic**—the signature visual.
4. **Monetization tension managed:** **Alignment boost** (visibility **within** already coherent dynamics) and **honest labeling** paths; **paid location** tied to **recalculated context**—reduces “random boost” clash with the brand promise.
5. **Feedback without opening the engine:** Mismatch feedback **adjusts presentation and weighting**, not user-facing raw rules—supports trust without **reverse-engineering**.
6. **Scope discipline:** **Eight** dynamics, **E5** data rules, **no** heavy social or long astro pedagogy at MVP—ship a coherent vertical slice.

**Alternatives users have today:** generalist apps (volume, ambiguous intent, metric games). **Why astromatch:** **same familiar swipe mental model**, **different philosophy of compatibility**—**sense-making and dynamics first**, **astrology as depth**, **not** as a scoreboard.

## Project Classification

| Dimension | Value |
|-----------|--------|
| **Project type** | **Mobile app** (iOS/Android; store compliance, push, IAP) |
| **Domain (CSV)** | **general** |
| **Product vertical** | **Consumer dating** |
| **Complexity** | **Medium** — IAP and store policy; **sensitive PII** (birth time/place); geo; **trust & safety** expectations for dating; **no** clinical/regulated healthcare path |
| **Project context** | **Greenfield** — no existing product codebase documented in-repo; brainstorming as primary input |

## Success Criteria

### User Success

- **Onboarding:** User completes signup with birth data (+ optional “unknown time”), **1–2 relationship dynamics**, and **current location** without expert astro knowledge.
- **Core loop:** User returns to the feed, reads **session card + suggested dynamic** on profiles, and swipes with clarity on **type of link**—not a % score.
- **Trust:** User uses **“doesn’t match me”** and perceives **display/suggestions** adjusting over time—without expecting to edit raw matching rules.
- **Delight:** Users describe outcomes as **“right for how I want to relate”** vs. chasing a compatibility number.

### Business Success

- **Early north star:** Habitual **DAU/WAU** on the feed + **non-zero** IAP conversion (swipes, boost, location pass—SKU emphasis TBD).
- **Engagement:** Sustainable **swipe depth** and **match rate** appropriate to a niche dating product (targets after baseline).
- **Monetization:** Revenue from **familiar IAP patterns** without **mystical paywalls** on “cosmic timing.”

### Technical Success

- **Privacy:** Birth/location data protected per consent; aligned with “no sale of birth data for ads” positioning.
- **Performance:** Feed/profile interactions feel **responsive** on mid-range devices (numeric SLAs TBD).
- **Internal correctness:** Chart/context logic for **E5** inputs is **testable and consistent** (UX remains non-technical).
- **Compliance:** **Apple / Google** requirements for IAP, accounts, and dating/social categories.

### Measurable Outcomes

- Onboarding **completion**; **time-to-first swipe**.
- **D1/D7 retention**; sessions per user per week.
- Use of **mismatch feedback** and subsequent engagement.
- **IAP conversion**; revenue / payer metrics (definitions TBD).

## Product Scope

### MVP - Minimum Viable Product

- **Eight** dynamics; user selects **up to two** sought dynamics at onboarding.
- **Session card** hero on profile; **no** public % compatibility.
- **E5** inputs; **no** advanced astro settings productized at launch.
- **Freemium** + **alignment boost** + **location pass** (pricing/rules TBD); **no** heavy in-app community feed.
- Flows per brainstorm: onboarding, feed, mismatch feedback, swipe quota, shop.

### Growth Features (Post-MVP)

- **Super swipe** if deferred from MVP; richer post-feedback **acknowledgment**; pricing/sku **A/B**.
- Expanded **trust & safety** (reporting, moderation).
- Brainstorm **roadmap**: non-dating modes, events, B2B/API.

### Vision (Future)

- Optional **deep astro** controls; alternate product hypotheses (e.g. display-only astro)—explicitly **not** MVP.

## User Journeys

### Journey 1 — Primary user, happy path: “First night that felt intentional”

**Maya**, 29, wants something between hookup apps and long compatibility quizzes. She installs **astromatch**, enters **birth date**, marks **unknown birth time**, enters **birth city**, picks **Romance** + **Au feeling**, and sets **location** (if **geolocation is denied**, she **manually enters city**—same flow must work).

**Opening:** Skeptical but curious—no % on the first card. **Rising action:** The **session card** shows short cosmic context and a **suggested dynamic**; she **likes** someone who feels coherent with her stated intent. **Climax:** She gets a **match** and the experience still feels **intentional**, not random. **Resolution:** She returns the next day; the feed stays **readable**.

**Success signal:** Time-to-first **meaningful** swipe/match; **D1** return after first session.

---

### Journey 2 — Primary user, edge: “This label is wrong for me”

**Jordan** chose **Léger** + **Aventure** but repeatedly sees dynamics that feel **too serious**. They use **“doesn’t match me”** → **the dynamic shown** → submit.

**Opening:** Frustration, near-churn. **Rising action:** Feed evolves; copy/suggestions shift **without** promising instant fixes or exposing rules. **Climax:** Later sessions feel **closer to intent**. **Resolution:** Trust in the **feedback loop**.

**Success signal:** **Retention** after using mismatch feedback; reduced repeated mismatch on same issue.

---

### Journey 2b — Onboarding friction: birth place ambiguity

User **misspells city** or picks **wrong place**; needs **correction** before charts/context are wrong.

**Capabilities:** Searchable place picker; **edit birth data** from settings; recompute context after fix.

**Success signal:** **Low drop-off** at birth-place step; **corrections** without support contact.

---

### Journey 3 — Monetization: “Out of swipes, still interested”

**Alex** hits the **daily limit**. **Opening:** Annoyance. **Rising action:** **Quota screen** → **offers**—copy must be **clear and non-mystical** (no “unlock the stars” paywall; **no** gating of “cosmic sync” as pay-only). **Climax:** Successful **IAP** (pack, boost, or pass—TBD). **Resolution:** Same-day or next-day return to feed.

**Success signal:** **Conversion** to paid; **low** refund/charge dispute rate.

---

### Journey 4 — Trust & safety / operations (MVP-realistic)

Reports of **harassment** or **fake profiles** land in a **review queue**. **MVP may be manual** (e.g. spreadsheet or external tool) until a **minimal in-app admin** exists—scope must match reality.

**Capabilities:** **Report profile**; moderator **review** + **action** (warn / ban); **audit** trail (depth TBD).

**Success signal:** Time-to-triage reports; **repeat offender** detection (later).

---

### Journey 5 — Support: account & data vs billing

- **Account / data:** wrong birth data, locked account, **delete my data** / export (per policy).
- **Billing / IAP:** purchase didn’t unlock, restore purchases, receipt issues.

**Capabilities:** Help entry; **contact**; FAQs; **store-compliant** refund/lift paths (playbooks, not legal advice in PRD).

**Success signal:** **First-contact resolution** rate; time-to-resolve billing issues.

---

### Journey 6 — Permissions: “Location off”

User **denies geolocation** at onboarding. Must still **enter city manually** and use the app **without** a dead-end.

**Success signal:** **Completion rate** when geoloc denied ≈ when allowed (within reasonable gap).

---

### Journey requirements summary

| Journey | Core capabilities | Primary success signal |
|--------|---------------------|-------------------------|
| 1 Happy path | Onboarding (E5), dynamics, feed, session card, match | Time-to-first meaningful engagement; D1 return |
| 2 Mismatch | Mismatch modal, recalibration behavior | Retention after feedback |
| 2b Birth place | Place picker, edit & recompute | Low drop-off; self-serve fix |
| 3 Monetization | Quota, shop, IAP, honest copy | IAP conversion; low payment friction |
| 4 Moderation | Report, review queue (manual OK MVP) | Triage time; basic safety bar |
| 5 Support | Help, contact, account vs billing paths | Resolution time / CSAT (TBD) |
| 6 Location off | Manual city fallback | Onboarding completion without geoloc |

**Excluded at MVP:** **API consumer / developer** journey—not applicable until a public API exists.

## Domain-Specific Requirements

*Classification used **general** (CSV) with **medium** product complexity for consumer dating + mobile IAP + sensitive PII.*

### Compliance & regulatory

- **Privacy:** Clear **privacy notice**; lawful basis for processing; **retention** and **deletion** paths; regional privacy rules (**GDPR / UK / US state** and others) per rollout—**jurisdictions confirmed with legal**.
- **Age:** **18+** (or local age of majority); **age gating** mechanism **TBD** (self-attest vs stronger verification by market).
- **Consumer / store:** Pricing clarity and **IAP** behavior per **Apple / Google** policies; **refunds** per store rules.
- **Astrology positioning:** **Entertainment / belief-based** framing where required—not medical, therapeutic, or guaranteed outcomes (**copy: legal review**).
- **Dating safety:** **Reporting** and escalation paths; depth scales post-MVP.

### Technical constraints

- **PII:** Birth and location data protected **in transit and at rest**; **least-privilege** access; logging without leaking sensitive fields.
- **Payments:** **Store-mediated IAP**; **restore purchases**; no primary card data in-app for standard SKUs.
- **Geo / time:** Correct **DST** and **location-change** behavior for consistent “context” (incl. paid location pass).

### Integration requirements

- **App stores:** App Store Connect / Google Play Console, IAP products, server notifications if used (**TBD**).
- **Places:** Autocomplete / geocoding for birth and current location (**provider TBD**).
- **Later:** Push/email; analytics (**privacy-compliant**).

### Risk mitigations

| Risk | Mitigation |
|------|------------|
| User harm (harassment, scams) | Report, block, moderation (manual MVP OK) |
| Payment disputes | Receipts, restore, support playbooks |
| Privacy backlash | Minimal data, consent, delete/export |
| Overclaiming astrology | Copy discipline + legal review |

## Innovation & Novel Patterns

### Detected innovation areas

1. **Compatibility without a public score** — Astro drives **ordering** in a **black box**; the UI avoids **% arms race** dynamics.
2. **Session card as primary canvas** — “Weather for relationships” metaphor; **cosmic garnish** supports **relationship dynamic**, not a competing numeric score.
3. **Product-level calibration** — “Doesn’t match me” **recalibrates what is shown** without **exposing or editing** raw matching rules.
4. **Alignment boost** — Paid **visibility within coherence** (same dynamic / alignment bucket), reducing **pay-to-win vs. natural match** tension if messaging stays honest.
5. **Distance demoted** — **Timing / climate / energy** narrative over **geo-as-hero** sorting—different philosophy than volume-first incumbents.

### Market context & competitive landscape

- **Incumbents** optimize for **volume**, **opaque ELO-like** behavior, and **unclear intent**.
- **astromatch** targets **meaning-first** dating; **astrology** is **positioning and engine**, not a **gimmick percentage**.
- **Risk:** Skepticism toward astrology products—**trust** comes from **UX clarity**, **safety basics**, and **honest monetization**.

### Validation approach

- **Qualitative:** Interviews on **card comprehension** and **emotional fit** of dynamics.
- **Quantitative:** Retention, **mismatch feedback** usage, engagement **without** mystical paywall dependency; **IAP** conversion with **clear** offers.
- **Experiments (selective):** Session card density, copy variants, **boost** disclosure.

### Risk mitigation

| Risk | Fallback |
|------|----------|
| **Black box** feels random | Stronger **narrative** + **feedback**; never promise full explainability |
| **Boost** feels sleazy | **Labeling**, **alignment** scope, frequency/cooldown rules |
| **Astro** controversy | **Entertainment/belief** framing; **no** medical or guaranteed-outcome claims |

## Mobile App Specific Requirements

### Project-type overview

**astromatch** is a **consumer mobile** product (iOS and Android). Core UX is **feed, session card, swipe actions, onboarding, and shop**—all **mobile-first**. **Desktop** and **CLI** are out of scope for this PRD (per `project-types.csv` **skip_sections**).

### Platform requirements

- **Targets:** Current **iOS** and **Android** OS versions (minimums **TBD** with engineering).
- **Implementation approach:** **Native vs cross-platform** — **open decision**; must support smooth **carousel**, **gestures**, and **session card** layout on common device sizes.
- **Distribution:** **App Store** and **Google Play**; **TestFlight** / internal testing tracks for QA.

### Device permissions & features

- **Photos:** **Camera** and/or **photo library** for profile images (platform permission copy required).
- **Location:** **Optional**; if denied, **manual city** entry for feed context (per user journeys).
- **Notifications:** **Opt-in**; used for **matches** and essential product events; comply with OS and user settings.

### Offline mode

- **MVP:** **Best-effort** display of **already fetched** profiles when the network is poor; **actions** (swipe, like, purchase) require connectivity or a **clear queue/retry** UX. **Full offline-first** is **not** MVP-required.

### Push strategy

- **Transactional:** Match, message (when messaging exists), **security/account** as needed.
- **Promotional:** Only with **explicit opt-in**; respect **frequency** and **quiet hours** policies.

### Store compliance

- **IAP** for digital goods per **Apple / Google** rules (no policy circumvention).
- **Account deletion**, **data access**, and **privacy** disclosures per stores and law.
- **Dating/social** category obligations; **age ratings** and **safety** copy as required.

### Technical architecture considerations

- **Client:** Screens for **onboarding**, **feed**, **profile card**, **shop**; **secure** token storage (**Keychain** / **Keystore**).
- **Backend:** **Accounts**, **profiles**, **matching/orchestration**, **events** (swipes, feedback), **IAP validation** (receipt verification / server notifications **TBD**).
- **Media:** Image **upload**, **processing**, **CDN** delivery (**TBD**).

### Implementation considerations

- **Accessibility:** Baseline support for **text scaling**, **contrast**, **touch targets** (detailed in UX work).
- **Performance:** **Cold start** and **scroll** targets **TBD** (SLAs).
- **Analytics:** **Privacy-compliant**; no sensitive **PII** in raw logs.

## Project Scoping & Phased Development

### MVP strategy & philosophy

- **Approach:** **Experience + learning MVP** — ship a **narrow, coherent** slice: **8 dynamics**, **session card**, **black-box feed ordering**, **mismatch feedback**, **E5 inputs**, **freemium + IAP** with **honest, non-mystical** commerce copy.
- **Team (indicative, TBD):** Mobile (1–2), backend (1), product/design part-time; **legal/privacy** review before store submission.

### MVP feature set (phase 1)

**Core user journeys supported:** Onboarding (birth, optional unknown time, up to **two** dynamics, location or manual city) → **feed** with **session card** → **swipe / super / like** → **match** → **in-app text messaging** with matches (**FR20**; rich media TBD). **Quota** + **shop**. **Report profile** + **manual** moderation path.

**Must-have capabilities:** Account & profile (photos, bio, E5 fields); opaque matching + feed ordering; session card + **eight** dynamic labels; swipe actions; match surfacing; **match messaging**; mismatch feedback with **recalibration** behavior; freemium limits + **IAP**; push for **matches and messages**; privacy notice; account deletion; age gate; minimal help/contact.

**Explicitly out of MVP:** Heavy **community** feed, **advanced astro** settings, **full** admin console (manual tools OK), **public API**.

### Post-MVP features

- **Phase 2 (growth):** **Super swipe** if deferred; richer **moderation**; **A/B** on limits and pricing; deeper **trust & safety**; richer **analytics**.
- **Phase 3 (expansion):** Non-dating modes, events, B2B/API; optional **deep** astro controls.

### Risk mitigation strategy

- **Technical:** Internally **testable** matching/chart logic; **store-native** IAP first; **simple** client.
- **Market:** **UX honesty** + **entertainment** framing for astrology; **no** guaranteed outcomes.
- **Resource:** **Manual** moderation/reporting; defer **extra** polish and **deep** analytics.

## Functional Requirements

*Party-mode refinements merged: in-app messaging after match, definite **block**, **IAP entitlement validation**, **rate limits** on sensitive actions.*

### Account & identity

- **FR1:** A **guest** can create an account using an authentication method the product supports (**exact methods TBD** — e.g. email, OAuth).
- **FR2:** A **registered user** can sign in and sign out on a device they control.
- **FR3:** A **registered user** can recover access when credentials are lost (**flow TBD**).
- **FR4:** A **registered user** can permanently delete their account and associated profile data per policy.
- **FR5:** The **system** can enforce **minimum age** for registration per jurisdiction and product rules.

### Profile & astro inputs (E5)

- **FR6:** A **registered user** can enter and update **date of birth**.
- **FR7:** A **registered user** can enter **birth time** or indicate **unknown birth time**.
- **FR8:** A **registered user** can enter **birth place** using a **searchable place** control and correct mistakes later.
- **FR9:** A **registered user** can enter **current location** via **device location** or **manual city** when location is unavailable or denied.
- **FR10:** The **system** can derive **timezone / DST** context from birth and location inputs without requiring expert astro controls at MVP.

### Relationship intent (dynamics)

- **FR11:** A **registered user** can select up to **two** **relationship dynamics** from the **eight** MVP labels as sought intent.
- **FR12:** A **registered user** can change sought dynamics later in settings (**limits TBD**).

### Feed, matching & ordering

- **FR13:** A **registered user** can view a **feed of candidate profiles** ordered by the product’s **matching engine** (**opaque** to the user).
- **FR14:** The **system** can ensure **no public numeric compatibility score** is shown in the MVP experience.
- **FR15:** A **registered user** can see **distance or locality** as **secondary** information relative to session and dynamic signals (**rules TBD**).

### Session card & presentation

- **FR16:** A **registered user** can see a **session card** on each profile that communicates **cosmic context** and **suggested relationship dynamic** without exposing raw engine rules.
- **FR17:** A **registered user** can browse **multiple photos** on a profile when provided.

### Engagement & match

- **FR18:** A **registered user** can **pass**, **like**, and **super-like** (if enabled) on a profile subject to **entitlements** and limits.
- **FR19:** A **registered user** can be notified when a **mutual match** occurs with another user.
- **FR20:** A **registered user** who has **mutually matched** can **send and receive text messages** with that user **in the app** (MVP messaging scope: **text**; **media/voice TBD**).

### Mismatch feedback & calibration

- **FR21:** A **registered user** can indicate **“does not match me”** on a profile.
- **FR22:** A **registered user** can optionally specify whether the issue is **the shown dynamic** or the **profile in general**.
- **FR23:** The **system** can adjust **what is presented** to the user over time in response to mismatch feedback **without** exposing or editing raw matching logic in the UI.

### Monetization & entitlements

- **FR24:** A **registered user** can consume a **daily free swipe allowance** (**amount TBD**).
- **FR25:** A **registered user** who hits **quota** can see **purchase options** that are **non-mystical** (no **cosmic** paywall gimmick).
- **FR26:** A **registered user** can purchase **additional swipes** via **in-app purchase** where allowed.
- **FR27:** A **registered user** can purchase **alignment boost** visibility subject to **eligibility** (**within coherent dynamics**).
- **FR28:** A **registered user** can purchase **temporary location change** (city/zone) and have **feed context** updated accordingly.
- **FR29:** A **registered user** can **restore** prior purchases per store rules.
- **FR30:** The **system** can **validate purchase entitlements** with **app stores** per supported **IAP** model (**receipt / server validation approach TBD**).

### Trust & safety

- **FR31:** A **registered user** can **report** another user or profile for abuse or policy violations.
- **FR32:** An **operator** can review reported cases and apply **warn / suspend / ban** using **MVP tools** (may be **manual** outside the app).
- **FR33:** A **registered user** can **block** another user; **blocked** users cannot **interact** with the blocker (**interaction scope TBD** — e.g. messages, likes).

### Privacy & legal surfaces

- **FR34:** A **guest or user** can view a **privacy notice** describing use of sensitive data (e.g. birth, location).
- **FR35:** A **registered user** can grant or withdraw **optional consents** where required (e.g. notifications, analytics — **list TBD**).

### Notifications

- **FR36:** A **registered user** can receive **push notifications** for **matches** and **new messages** subject to OS permissions and user settings.

### Support

- **FR37:** A **registered user** can access **help** and **contact support** for **account/data** issues and **billing** issues (**channels TBD**).

### Content & media

- **FR38:** A **registered user** can upload and manage **profile photos** within limits (**count/size TBD**).
- **FR39:** A **registered user** can enter a **short bio** or free-text profile fields (**limits TBD**).

### System & integrity

- **FR40:** The **system** can authenticate **client requests** for signed-in users (**token/session model TBD**).
- **FR41:** The **system** can persist **swipe and feedback events** for product behavior, safety, and **privacy-minimized** analytics.
- **FR42:** The **system** can apply **rate limits** on **abuse-prone actions** (e.g. login, swipe bursts, reports — **thresholds TBD**).

## Non-Functional Requirements

### Performance

- **NFR-P1:** **Feed scrolling** (list + profile card) remains **usable** on **mid-range** devices representative of the target market (**FPS / jank targets TBD**).
- **NFR-P2:** **Cold start** to first usable signed-in screen meets an **upper bound** agreed with engineering (**seconds TBD** per platform).
- **NFR-P3:** Primary actions (**swipe, like, purchase**) complete or surface **clear** loading/error within **bounded latency** under **normal network** (**p95 TBD**).

### Security

- **NFR-S1:** **Birth data, location, and auth credentials** are protected **in transit** (TLS) and **at rest** using **industry-standard** controls (**detail TBD**).
- **NFR-S2:** **Least-privilege** data access server-side; **no** sensitive fields in default **client logs** or **analytics** payloads.
- **NFR-S3:** **IAP** handling meets **store** security expectations and aligns with **FR30**.

### Scalability

- **NFR-SC1:** Service architecture supports **order-of-magnitude** DAU growth from launch baseline **without** redesigning core user flows (**approach TBD**).
- **NFR-SC2:** **Evening / peak** usage patterns do not cause **system-wide** failure (**load strategy TBD**).

### Accessibility

- **NFR-A1:** Core flows support **OS text scaling** and **readable contrast** on default themes (**WCAG level TBD**).
- **NFR-A2:** **Touch targets** and **gestures** meet **platform** HIG baselines (**audit TBD**).

### Integration

- **NFR-I1:** **App Store / Play** flows (IAP, account, deletion) meet **documented** store requirements at release.
- **NFR-I2:** **Push** uses a **reliable** provider path; **failures** are **observable** (**monitoring TBD**).
- **NFR-I3:** **Place / geocoding** integrations **degrade gracefully** (retry, manual entry) when third-party services are impaired.

### Reliability

- **NFR-R1:** **Auth, feed, swipe, and purchase** paths return **actionable** errors—not silent failure.

## Brainstorming traceability

*Source: `_bmad-output/brainstorming/brainstorming-session-2026-03-27-002226.md`. Items below are **intentionally** not full FRs—they capture **tone**, **open bets**, and **localization**.*

- **Mystery vs frustration:** The product must offer **enough** narrative signal to feel **legitimate** without opening the engine—reflected in **session card** + **mismatch** design; detailed **copy** is UX work.
- **Optional post-MVP polish:** **Micro-acknowledgment** after “doesn’t match me” (animation or short line)—explicitly **not** an MVP requirement in brainstorm; optional **Growth**.
- **Social proof in hero:** Brainstorm left **flexibility** on global like counters / social metrics—**neither mandated nor forbidden** in this PRD (design decision).
- **Exploration backlog (not MVP):** **Swipeless** ordered feed; **IAP** on **dynamics** or **locations** instead of swipes—**research only**, not committed.
- **Language:** Brainstorm **UI labels** were in **French**; this PRD is **English**—shipping locales may **localize** labels and copy.
