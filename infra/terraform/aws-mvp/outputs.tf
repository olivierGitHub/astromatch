output "alb_dns_name" {
  description = "DNS publique de l'ALB (HTTP) — pointer un enregistrement CNAME ou utiliser tel quel pour les tests."
  value       = aws_lb.main.dns_name
}

output "ecr_repository_url" {
  description = "URL de push/pull ECR pour l'image API."
  value       = aws_ecr_repository.api.repository_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  value = aws_ecs_service.api.name
}

output "ecr_repository_name" {
  value = aws_ecr_repository.api.name
}

output "rds_endpoint" {
  description = "Hôte PostgreSQL (réseau privé uniquement)."
  value       = aws_db_instance.postgres.address
  sensitive   = true
}

output "rds_master_password" {
  description = "Mot de passe généré pour l'utilisateur DB (également injecté dans la tâche ECS)."
  value       = random_password.db.result
  sensitive   = true
}
