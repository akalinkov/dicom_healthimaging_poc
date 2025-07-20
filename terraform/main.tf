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

# S3 bucket for DICOM files
resource "aws_s3_bucket" "dicom_files" {
  bucket = "${var.project_name}-dicom-files-${var.environment}"

  tags = {
    ProvisionedBy = "terraform"
    Environment   = var.environment
    Project       = var.project_name
    Purpose       = "DICOM files for HealthImaging import"
  }
}

# S3 bucket public access block (private bucket)
resource "aws_s3_bucket_public_access_block" "dicom_files" {
  bucket = aws_s3_bucket.dicom_files.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
