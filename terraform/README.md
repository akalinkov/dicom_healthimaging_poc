# Terraform Infrastructure

Creates AWS HealthImaging datastore for the DICOM POC.

## What it Creates

- **HealthImaging Datastore**: DICOM storage and indexing service

## Usage

```bash
# Initialize Terraform (first time only)
terraform init

# Review planned changes
terraform plan

# Apply infrastructure changes
terraform apply

# Get datastore ID
terraform output healthimaging_datastore_id

# Clean up (when done)
terraform destroy
```

## Outputs

- `healthimaging_datastore_id` - Datastore ID for API calls
- `healthimaging_datastore_arn` - Full ARN of the datastore

## Authentication

Uses your existing AWS credentials (SSO, CLI profile, or environment variables). No additional IAM resources are created.

## Customization

Modify variables in `main.tf`:
- `aws_region` - AWS region (default: us-east-1)
- `project_name` - Project name prefix
- `environment` - Environment tag (default: dev)