variable "aws_region" {
  type        = string
  description = "Région AWS (ex. eu-west-3 Paris)."
  default     = "eu-west-3"
}

variable "project_name" {
  type        = string
  description = "Préfixe des ressources."
  default     = "astromatch"
}

variable "environment" {
  type        = string
  description = "Nom d'environnement (mvp, staging, prod)."
  default     = "mvp"
}

variable "container_image" {
  type        = string
  description = "URI image ECR (ex. 123456789.dkr.ecr.eu-west-3.amazonaws.com/astromatch-api:git-sha). Créée par le workflow CI ou docker push manuel."

  validation {
    condition     = length(trimspace(var.container_image)) > 0
    error_message = "container_image doit être une URI non vide."
  }
}

variable "db_name" {
  type        = string
  default     = "astromatch"
}

variable "db_username" {
  type        = string
  default     = "astromatchapp"
}

variable "db_instance_class" {
  type        = string
  description = "Classe RDS (micro pour budget ~100 EUR)."
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  type        = number
  default     = 20
}

variable "fargate_cpu" {
  type        = number
  description = "Unités CPU Fargate (256 = 0,25 vCPU)."
  default     = 256
}

variable "fargate_memory" {
  type        = number
  description = "Mémoire MiB (512 pour 0,25 vCPU)."
  default     = 512
}

variable "desired_count" {
  type        = number
  default     = 1
}

variable "jwt_secret" {
  type        = string
  sensitive   = true
  description = "Secret JWT (min. 256 bits recommandés). Passé à la tâche ECS."

  validation {
    condition     = length(var.jwt_secret) >= 32
    error_message = "jwt_secret doit faire au moins 32 caractères."
  }
}

variable "operator_api_key" {
  type        = string
  sensitive   = true
  description = "Clé API opérateur (Epic 6)."
  default     = "change-me-operator-key"
}

variable "skip_final_snapshot" {
  type        = bool
  description = "true = destruction RDS sans snapshot final (MVP uniquement)."
  default     = true
}
