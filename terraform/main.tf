# Terraform Infrastructure as Code
# Example AWS deployment configuration

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "travelhub-terraform-state"
    key    = "production/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "travelhub-vpc"
    Environment = var.environment
  }
}

# ECS Cluster for container orchestration
resource "aws_ecs_cluster" "main" {
  name = "travelhub-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Environment = var.environment
  }
}

# RDS PostgreSQL Database
resource "aws_db_instance" "postgres" {
  identifier             = "travelhub-db"
  engine                 = "postgres"
  engine_version         = "16.1"
  instance_class         = var.db_instance_class
  allocated_storage      = 100
  storage_encrypted      = true
  db_name                = "travelhub"
  username               = var.db_username
  password               = var.db_password
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  multi_az               = true
  backup_retention_period = 7
  skip_final_snapshot    = false
  final_snapshot_identifier = "travelhub-final-snapshot"

  tags = {
    Environment = var.environment
  }
}

# ElastiCache Redis for caching
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "travelhub-cache"
  engine               = "redis"
  node_type            = var.redis_node_type
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  engine_version       = "7.0"
  port                 = 6379
  security_group_ids   = [aws_security_group.redis.id]
  subnet_group_name    = aws_elasticache_subnet_group.main.name

  tags = {
    Environment = var.environment
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "travelhub-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = true

  tags = {
    Environment = var.environment
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/travelhub"
  retention_in_days = 30

  tags = {
    Environment = var.environment
  }
}

# Security Groups
resource "aws_security_group" "alb" {
  name        = "travelhub-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "travelhub-alb-sg"
    Environment = var.environment
  }
}

# Outputs
output "alb_dns_name" {
  value       = aws_lb.main.dns_name
  description = "DNS name of the load balancer"
}

output "rds_endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "RDS database endpoint"
  sensitive   = true
}

output "redis_endpoint" {
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
  description = "Redis cache endpoint"
  sensitive   = true
}