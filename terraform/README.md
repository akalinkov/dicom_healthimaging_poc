# Terraform Infrastructure

This directory contains the Terraform configuration for the DICOM HealthImaging POC infrastructure.

## What it Creates

- **IAM Policy**: Least privilege policy for AWS HealthImaging operations
- **IAM User**: Application user with only required permissions
- **Access Keys**: AWS credentials for the application

## Required Permissions

The IAM policy grants access to:
- `medical-imaging:SearchImageSets`
- `medical-imaging:GetImageSetMetadata`
- `medical-imaging:GetImageFrame`

## Security Features

- **Least Privilege**: Only required permissions are granted
- **Region Restriction**: Access is limited to the specified AWS region
- **Resource Scoping**: Permissions are scoped appropriately

## Usage

```bash
# Initialize Terraform (first time only)
terraform init

# Review planned changes
terraform plan

# Apply infrastructure changes
terraform apply

# Get outputs (credentials)
terraform output -json

# Clean up (when done)
terraform destroy
```

## Outputs

After applying, use the following to get your AWS credentials:

```bash
# Get all outputs in JSON format
terraform output -json

# Get specific outputs
terraform output aws_access_key_id
terraform output aws_secret_access_key
terraform output setup_instructions
```

## Important Notes

- **Keep credentials secure**: Never commit the generated credentials to version control
- **Environment Variables**: Copy the credentials to your `.env` file in the project root
- **State Files**: The `.tfstate` files contain sensitive information and are excluded from git

## Customization

You can customize the deployment by modifying variables in `main.tf`:

- `aws_region`: Change the AWS region (default: us-east-1)
- `project_name`: Modify the project name prefix
- `environment`: Change the environment tag (default: dev)
