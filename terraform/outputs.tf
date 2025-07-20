output "aws_region" {
  description = "AWS region where resources are created"
  value       = var.aws_region
}

# Instructions for setup
output "setup_instructions" {
  description = "Instructions for setting up local development"
  value       = <<-EOF
    HealthImaging datastore created successfully!
    
    Datastore ID: ${awscc_healthimaging_datastore.dicom_datastore.datastore_id}
    
    For local development:
    1. Use AWS SSO: aws configure sso && aws sso login
    2. Or use AWS CLI profiles: aws configure --profile your-profile
    
    Add to your .env file:
    AWS_REGION=${var.aws_region}
    HEALTHIMAGING_DATASTORE_ID=${awscc_healthimaging_datastore.dicom_datastore.datastore_id}
    
    Make sure your AWS credentials have HealthImaging permissions.
  EOF
}
