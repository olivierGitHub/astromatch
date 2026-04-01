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
```

### Android

#### Option 1 — Expo Go (recommandé pour le dev rapide)

1. Installe **[Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)** sur ton téléphone Android.
2. Lance le serveur Metro :
   ```bash
   npx expo start
   ```
3. Scanne le QR code affiché dans le terminal avec l'app **Expo Go**.

> Ton téléphone et ton PC doivent être sur le **même réseau Wi-Fi**.
> Si la connexion échoue, utilise le tunnel : `npx expo start --tunnel`

#### Option 2 — Émulateur Android (Android Studio)

1. Installe **Android Studio** et crée un AVD (Android Virtual Device).
2. Démarre l'émulateur depuis Android Studio.
3. Lance :
   ```bash
   npx expo start --android
   ```

#### Option 3 — Téléphone physique via USB (development build)

1. Active le **Mode développeur** sur ton téléphone :
   Paramètres → À propos → appuie 7 fois sur « Numéro de build »
2. Active **USB Debugging** dans les Options développeur.
3. Branche le téléphone en USB et vérifie qu'il est détecté :
   ```bash
   adb devices
   ```
4. Compile et installe l'APK :
   ```bash
   npx expo run:android
   ```
   > Cette commande compile l'APK (~5-10 min la première fois) et l'installe automatiquement.
   > Les fois suivantes, `npx expo start` suffit sans recompiler.

---

### iOS

#### Option 1 — Expo Go (recommandé pour le dev rapide)

> Requis : un Mac avec Xcode installé, ou un iPhone/iPad avec **[Expo Go](https://apps.apple.com/app/expo-go/id982107779)**.

1. Installe **Expo Go** depuis l'App Store.
2. Lance le serveur Metro :
   ```bash
   npx expo start
   ```
3. Scanne le QR code avec l'**appareil photo** de l'iPhone (iOS 11+) — le lien `exp://` s'ouvrira dans Expo Go.

> Ton iPhone et ton PC doivent être sur le **même réseau Wi-Fi**.
> Si la connexion échoue, utilise le tunnel : `npx expo start --tunnel`

#### Option 2 — Simulateur iOS (macOS uniquement)

1. Installe **Xcode** depuis le Mac App Store.
2. Lance :
   ```bash
   npx expo start --ios
   ```
   > Expo ouvrira automatiquement le simulateur iOS.

#### Option 3 — Appareil physique iOS (development build, macOS uniquement)

1. Connecte l'iPhone en USB.
2. Fais confiance à l'ordinateur sur l'iPhone si demandé.
3. Compile et installe l'app :
   ```bash
   npx expo run:ios --device
   ```

---

### Pointer vers l'API locale

Définis l'URL de base avant de lancer Expo :

```bash
export EXPO_PUBLIC_API_BASE_URL=http://<IP_DE_TA_MACHINE>:8080
npx expo start
```

> Sur un émulateur Android, utilise `http://10.0.2.2:8080` pour pointer vers la machine hôte.

Copy `astromatch-mobile/.env.example` to `.env` when adding API base URLs.

## CI

GitHub Actions: `ci-api.yml`, `ci-mobile.yml`, `openapi-check.yml` (see `.github/workflows/`).

## Env files

- `astromatch-api/.env.example` — placeholder for Spring overrides
- `astromatch-mobile/.env.example` — placeholder for Expo public config

Do not commit real secrets.
