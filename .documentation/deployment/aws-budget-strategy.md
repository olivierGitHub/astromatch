# Stratégie AWS — budget ~100 €/mois (vue architecte)

> **Perspective architecture (Winston)** : on privilégie un socle **simple, observable et évolutif**, pas la solution la moins chère absolue si elle casse l’exploitation. Pour ~**100 €/mois TTC** (ordre de grandeur, selon région, transfert et taux), un **MVP sur ECS Fargate + RDS PostgreSQL + ALB** reste cohérent avec l’architecture cible (API stateless, base managée), tout en restant sous plafond si l’on reste sur **une seule tâche Fargate petite** et **RDS `db.t4g.micro`**.

## Enveloppe budgétaire

Les postes fixes typiques (région **eu-west-3** Paris, ordres de grandeur **avant** transfert données et TVA) :

| Poste | Commentaire |
|-------|-------------|
| **Application Load Balancer** | Coût de présence non négligeable ; reste justifié pour TLS, health checks stables et future montée en charge sans refonte. |
| **Fargate 0,25 vCPU / 512 MiB, 1 tâche 24/7** | API Spring Boot minimaliste ; JVM serrée — acceptable pour MVP. |
| **RDS PostgreSQL `db.t4g.micro`, mono-AZ, 20 Go** | Aligné PRD (PostgreSQL) ; sauvegardes et patchs gérés par AWS. |
| **ECR, CloudWatch Logs, VPC** | Restent en général modestes à ce volume. |

**Pas de NAT Gateway** dans le Terraform proposé : les tâches Fargate sont dans des **sous-réseaux publics** avec **IP publique** pour tirer les images et joindre les services AWS, tandis que **RDS** reste en **sous-réseaux privés** uniquement joignables depuis le SG des tâches. Cela évite ~**30–35 $/mois** de NAT typique.

Au total, on vise souvent **~60–90 €/mois** de fixe + marge pour transfert et monitoring ; **100 €** laisse une **réserve** pour pics légers ou hausse de prix list.

## Capacité — utilisateurs actifs quotidiens (DAU)

Les DAU ne sont pas une métrique technique seule : tout dépend du **nombre d’appels API par utilisateur actif**, des **pics** (soirée) et du **p95** des requêtes.

Hypothèses **prudentes** pour cette taille de tâche :

- Charge **majoritairement** JSON (auth, feed pageable, swipes, quelques messages).
- Pas de gros traitement synchrone ni de volumétrie média servie en masse par la même tâche (les photos restent dimensionnées raisonnablement).

**Ordre de grandeur recommandé pour le dimensionnement Terraform fourni :**

- **~100 à 200 DAU** : zone **confortable** avec une seule tâche **0,25 vCPU / 512 MiB**, si les requêtes restent courtes et le cache applicatif maîtrisé.
- **~200 à 400 DAU** : possible en **bonne discipline** (indexes SQL, pas de N+1, cache Redis ultérieur, CDN pour assets statiques) — à **surveiller** (CPU Fargate, latence RDS, erreurs 5xx).
- **Au-delà** : prévoir **0,5 vCPU** et/ou **2 tâches** + lecture RDS optimisée — **hors** de l’enveloppe stricte des 100 € sans arbitrage (coût ALB + Fargate + RDS augmente).

Ces chiffres sont des **guides**, pas des SLA : la seule vérité est le **profil de charge mesuré** (CloudWatch, APM).

## Évolution sans rupture

1. **Vertical** : passer la tâche Fargate à **0,5 vCPU / 1 GiB**.
2. **Horizontal** : `desired_count = 2` (sessions stateless + JWT).
3. **Données** : `db.t4g.small`, réplicas lecture plus tard.
4. **Sécurité** : certificat **ACM** sur l’ALB (HTTPS), secrets dans **Secrets Manager** au lieu de variables en clair dans la task definition.
5. **Observabilité** : dashboards ALB + ECS + RDS, alarmes sur 5xx et latence.

## Implémentation dans ce repo

- Terraform : **`infra/terraform/aws-mvp/`** (VPC, ALB, ECS Fargate, ECR, RDS, IAM minimal). Voir le [**README du module**](../../infra/terraform/aws-mvp/README.md) pour l’ordre **ECR → première image → `terraform apply`**.
- CD : workflow **`deploy-api-ecs.yml`** et secrets décrits dans [github-actions-cicd.md](./github-actions-cicd.md). La variable **`ECR_REPOSITORY`** doit correspondre à la sortie Terraform `ecr_repository_name` (ex. `astromatch-mvp-api`).

**Avertissement** : le module MVP utilise `skip_final_snapshot = true` et un listener **HTTP:80** pour réduire la friction ; la **production** doit activer **HTTPS**, snapshots RDS, et durcissement des secrets.
