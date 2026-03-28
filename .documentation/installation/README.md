# Installation et exécution locale

## Prérequis

| Composant | Version recommandée |
|-----------|---------------------|
| Java | **21** (Temurin ou équivalent) |
| Maven | embarqué via `./mvnw` dans `astromatch-api` |
| Node.js | **22** (pour le mobile) |
| PostgreSQL | **14+** (optionnel si vous restez sur H2 embarqué pour des essais rapides) |

Outils utiles : **Git**, **Docker** (pour image API ou Postgres local), **Expo CLI** / application **Expo Go** sur téléphone.

## API Spring Boot (`astromatch-api`)

### Sans PostgreSQL (H2 en mémoire, défaut du `application.properties`)

```bash
cd astromatch-api
./mvnw -B verify
./mvnw spring-boot:run
```

L’API écoute en général sur **http://localhost:8080**. Santé : `GET http://localhost:8080/actuator/health`.

### Avec PostgreSQL

1. Créez une base et un utilisateur (ex. `astromatch` / mot de passe local).
2. Exportez l’URL JDBC avant de lancer :

```bash
export SPRING_DATASOURCE_URL='jdbc:postgresql://localhost:5432/astromatch'
export SPRING_DATASOURCE_USERNAME='astromatch'
export SPRING_DATASOURCE_PASSWORD='votre_mot_de_passe'
export SPRING_DATASOURCE_DRIVER_CLASS_NAME='org.postgresql.Driver'
cd astromatch-api
./mvnw spring-boot:run
```

Flyway appliquera les migrations au démarrage.

### Variables fréquentes (non exhaustif)

| Variable | Rôle |
|----------|------|
| `ASTROMATCH_JWT_SECRET` | Secret HS256 (obligatoire en prod, long et aléatoire) |
| `ASTROMATCH_OPERATOR_API_KEY` | Clé API modération (Epic 6) |
| `ASTROMATCH_PUSH_ENABLED` | `true` / `false` |
| `ASTROMATCH_BILLING_STUB_VALIDATION_ENABLED` | stub IAP en dev |

Voir `astromatch-api/src/main/resources/application.properties`.

### Image Docker (optionnel)

```bash
cd astromatch-api
./mvnw -B -DskipTests package
docker build -t astromatch-api:local .
docker run --rm -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/astromatch \
  -e SPRING_DATASOURCE_USERNAME=astromatch \
  -e SPRING_DATASOURCE_PASSWORD=secret \
  -e ASTROMATCH_JWT_SECRET=change-me-min-256-bits \
  astromatch-api:local
```

## Application mobile Expo (`astromatch-mobile`)

```bash
cd astromatch-mobile
npm ci
npm run lint
```

Lancer le bundler :

```bash
npx expo start
```

### Pointer vers votre API

Définissez l’URL de base (sans slash final) :

```bash
export EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
# ou IP LAN de votre machine pour un appareil physique
npx expo start
```

Sur Android émulateur, `http://10.0.2.2:8080` pointe souvent vers la machine hôte.

## Contrat OpenAPI (`api-contract`)

Validation syntaxique (comme en CI) :

```bash
pip install pyyaml
python -c "import yaml; yaml.safe_load(open('api-contract/openapi.yaml')); print('OK')"
```

Avec [Redocly CLI](https://redocly.com/docs/cli/) :

```bash
npx @redocly/cli lint api-contract/openapi.yaml
```

## Ordre conseillé pour un premier test bout en bout

1. Démarrer l’API (H2 ou Postgres).
2. Configurer `EXPO_PUBLIC_API_BASE_URL`.
3. `npx expo start`, ouvrir dans Expo Go, parcours inscription → onboarding → feed.
