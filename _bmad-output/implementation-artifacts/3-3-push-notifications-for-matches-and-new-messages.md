# Story 3.3: Push notifications for matches and new messages

Status: done

## Story

As a **registered user**,
I want **push notifications for matches and new messages when I allow them**,
So that **I don’t miss important moments** (FR36).

## Acceptance Criteria

**Given** OS permission and user notification settings  
**When** a match or new message arrives  
**Then** a push is delivered via the chosen provider path  
**When** denied or disabled  
**Then** in-app surfaces still work and settings are respected  
**And** failures are observable (NFR-I2).

**Maps:** FR36; NFR-I2.

## Tasks / Subtasks

- [x] **API** — `PUT /api/v1/me/device/push-token`; Expo push sender behind `astromatch.push.enabled`; notify on match / message (when enabled).
- [x] **Mobile** — `expo-notifications` + `registerPushTokenWithServer` on home mount; non-fatal logging on failure (NFR-I2).

## Change Log

- 2026-03-29: Push registration, `app.json` plugin, contract for push-token endpoint.

## Dev Agent Record

### Completion Notes

- Integration tests disable push via `astromatch.push.enabled=false`; production can enable with valid Expo credentials.

### File List

- `astromatch-api` — `ExpoPushNotificationService`, `ProfileService.updateExpoPushToken`, `MemberProfileController`
- `astromatch-mobile/src/services/push.ts`
- `astromatch-mobile/src/features/auth/HomeScreen.tsx`
- `astromatch-mobile/app.json`
- `astromatch-mobile/package.json`
