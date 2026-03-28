# astromatch

Mobile dating product (Expo + Spring Boot). Planning artifacts live under `_bmad-output/planning-artifacts/`.

## Repository layout

| Path | Description |
|------|-------------|
| `astromatch-mobile/` | Expo (React Native) + TypeScript |
| `astromatch-api/` | Spring Boot API |
| `api-contract/` | OpenAPI 3 source of truth |
| `_bmad-output/` | BMad planning & implementation tracking |

## Prerequisites

- **Node.js** 20+ and npm (for mobile)
- **Java 21** and Maven wrapper (for API)

## API (local)

```bash
cd astromatch-api
./mvnw spring-boot:run
```

- Default port: **8080**
- Health: **GET** `http://localhost:8080/actuator/health` (expect `UP` in JSON)

Story 1.1 uses an **in-memory H2** database so PostgreSQL is not required. Set `SPRING_DATASOURCE_*` via `.env` or env vars when connecting to Postgres.

## Mobile (local)

```bash
cd astromatch-mobile
npm install
npx expo start
```

Use the Expo CLI or an emulator. Copy `astromatch-mobile/.env.example` to `.env` when adding API base URLs.

## CI

GitHub Actions: `ci-api.yml`, `ci-mobile.yml`, `openapi-check.yml` (see `.github/workflows/`).

## Env files

- `astromatch-api/.env.example` — placeholder for Spring overrides
- `astromatch-mobile/.env.example` — placeholder for Expo public config

Do not commit real secrets.
