# Terraform — MVP AWS (AstroMatch API)

Provisionne un VPC minimal, **ALB**, **ECS Fargate** (tâche publique sans NAT), **RDS PostgreSQL** privé, **ECR** et journaux CloudWatch.

## Prérequis

- Compte AWS, profil CLI configuré (`AWS_PROFILE` ou variables d’environnement).
- [Terraform](https://developer.hashicorp.com/terraform/install) ≥ 1.5.

## Première fois : image avant service stable

Le dépôt ECR est vide après création. Ordre recommandé :

1. `cp terraform.tfvars.example terraform.tfvars` et renseigner `jwt_secret`, `container_image` (URI complète après étape 3), etc.
2. `terraform apply -target=aws_ecr_repository.api` (ou apply complet en acceptant que le service ECS échoue tant qu’aucune image n’existe).
3. Se connecter à ECR, construire depuis la racine du monorepo :  
   `docker build -t <account>.dkr.ecr.<region>.amazonaws.com/<nom-repo>:initial astromatch-api`  
   puis `docker push …:initial`.
4. Mettre `container_image` dans `terraform.tfvars` sur cette URI, puis `terraform apply`.

Ensuite les déploiements passent par [`.github/workflows/deploy-api-ecs.yml`](../../../.github/workflows/deploy-api-ecs.yml) (voir `.documentation/deployment/`).

## Commandes

```bash
terraform init
terraform plan
terraform apply
```

Sorties utiles : `alb_dns_name`, `ecr_repository_url`, `ecs_cluster_name`, `ecs_service_name`, `ecr_repository_name`.

## Fichiers

| Fichier | Rôle |
|---------|------|
| `main.tf` | Réseau, RDS, ECR, ALB, ECS |
| `variables.tf` | Paramètres (image, JWT, taille Fargate, etc.) |
| `outputs.tf` | DNS ALB, noms ECS/ECR, secrets DB (sensibles) |
| `versions.tf` | Provider AWS, `random` |
