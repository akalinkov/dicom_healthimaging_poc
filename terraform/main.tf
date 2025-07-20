terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    awscc = {
      source  = "hashicorp/awscc"
      version = "~> 1.49"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

provider "awscc" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "dicom-healthimaging-poc"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}
