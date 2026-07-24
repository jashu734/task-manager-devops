variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region for deployment"
}

variable "app_name" {
  type        = string
  default     = "devops-task-manager"
  description = "Name prefix for all resources"
}

variable "environment" {
  type        = string
  default     = "dev"
  description = "Environment identifier"
}

variable "db_name" {
  type        = string
  default     = "taskdb"
  description = "PostgreSQL Database Name"
}

variable "db_user" {
  type        = string
  default     = "postgres"
  description = "PostgreSQL Master Username"
}

variable "db_password" {
  type        = string
  default     = "DevOpsTaskPass2026!"
  sensitive   = true
  description = "PostgreSQL Master Password"
}

variable "container_port" {
  type        = number
  default     = 3000
  description = "Port exposed by Node app container"
}
