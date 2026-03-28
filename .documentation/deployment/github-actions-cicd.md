# CI/CD — GitHub Actions

Ce dépôt utilise des workflows **déclenchés par chemins** (push / PR) pour limiter les exécutions inutiles.

## Workflows existants

### `ci-api.yml` — API Java

- **Chemins** : `astromatch-api/**`, le fichier workflow lui-même.
- **Job** : Java 21 (Temurin), cache Maven, `./mvnw -B verify` (tests + package).

### `ci-mobile.yml` — Mobile Expo

- **Chemins** : `astromatch-mobile/**`, workflow.
- **Job** : Node 22, `npm ci`, `npm run lint` (TypeScript `--noEmit`).

### `openapi-check.yml` — Contrat API

- **Chemins** : `api-contract/**`, workflow.
- **Job** : Python 3.12, parse YAML d’`openapi.yaml` pour éviter les fichiers cassés.

Fichiers : `.github/workflows/*.yml`.

## Déploiement (CD) — modèle recommandé

La **CI** valide le code ; le **CD** pousse une image et met à jour **ECS** (voir [aws-budget-strategy.md](./aws-budget-strategy.md) et `infra/terraform/aws-mvp/`).

Un exemple de workflow **`deploy-api-ecs.yml`** est fourni : il s’exécute sur **`workflow_dispatch`** (déclenchement manuel) pour :

1. S’authentifier sur AWS via **OIDC** (pas de clé AWS longue durée dans GitHub).
2. Se connecter à **ECR**, construire l’image depuis `astromatch-api/Dockerfile`, la pousser.
3. Demander à **ECS** un nouveau déploiement du service.

### Secrets et variables GitHub à configurer

| Nom | Type | Rôle |
|-----|------|------|
| `AWS_ROLE_ARN` | secret | ARN du rôle IAM assumé par OIDC (`sts:AssumeRoleWithWebIdentity`). |
| `AWS_REGION` | variable | ex. `eu-west-3`. |
| `ECR_REPOSITORY` | variable | Nom du repo ECR (ex. `astromatch-api`, aligné sur Terraform `aws_ecr_repository`). |
| `ECS_CLUSTER_NAME` | variable | Nom du cluster ECS. |
| `ECS_SERVICE_NAME` | variable | Nom du service Fargate. |

### IAM OIDC — résumé

1. Dans **IAM → Identity providers**, ajouter **GitHub** (issuer `https://token.actions.githubusercontent.com`).
2. Créer un rôle **Web identity** pour ce provider, audience `sts.amazonaws.com`, condition sur `sub` / `aud` pour limiter au repo `votre-org/astromatch`.
3. Attacher des politiques : `AmazonEC2ContainerRegistryPowerUser` (push ECR), `AmazonECS_FullAccess` ou politique minimale `ecs:UpdateService`, `ecs:DescribeServices`, etc.

Adapter les ARN aux noms réels créés par Terraform (`terraform output`).

### Déclencher un déploiement

GitHub → **Actions** → **Deploy API to ECS** → **Run workflow** (branche + tag d’image optionnel).

## Bonnes pratiques

- Garder la **CI** sur chaque PR ; réserver le **CD** aux branches protégées ou au manuel jusqu’à maturité des tests.
- Après changement d’`openapi.yaml`, la CI contrat doit passer avant merge.
- Pour la prod : activer les **environnements** GitHub (approbations, secrets par env).
