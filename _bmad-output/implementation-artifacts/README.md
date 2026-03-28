# Implementation artifacts (astromatch)

## Layout

- **`sprint-status.yaml`** — Sprint / epic / story tracking (stays at this root).
- **`deferred-work.md`** — Cross-cutting deferred items.
- **`epic-{N}/`** — All user story markdown files for epic `N`, plus that epic’s retrospective:
  - `{N}-{M}-<kebab-title>.md` — Story files (keys match `development_status` in `sprint-status.yaml`).
  - `epic-{N}-retro-YYYY-MM-DD.md` — Post-epic retrospective.

## Path convention for agents

For story key `1-2-create-an-account-with-a-supported-sign-up-method`, the file is:

`_bmad-output/implementation-artifacts/epic-1/1-2-create-an-account-with-a-supported-sign-up-method.md`

Retrospective for epic 1:

`_bmad-output/implementation-artifacts/epic-1/epic-1-retro-2026-03-28.md`

New stories should be created under the matching **`epic-{epicNum}/`** folder.
