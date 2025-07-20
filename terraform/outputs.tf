output "aws_region" {
  description = "AWS region where resources are created"
  value       = var.aws_region
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket for DICOM files"
  value       = aws_s3_bucket.dicom_files.bucket
}

output "healthimaging_policy_arn" {
  description = "ARN of the HealthImaging policy to attach to your user"
  value       = aws_iam_policy.healthimaging_policy.arn
}

output "healthimaging_import_role_arn" {
  description = "ARN of the HealthImaging import role for console operations"
  value       = aws_iam_role.healthimaging_import.arn
}

# Instructions for setup
output "setup_instructions" {
  description = "Instructions for setting up local development"
  value       = <<-EOF
    HealthImaging infrastructure created successfully!
    
    Datastore ID: ${awscc_healthimaging_datastore.dicom_datastore.datastore_id}
    S3 Bucket: ${aws_s3_bucket.dicom_files.bucket}
    Import Role ARN: ${aws_iam_role.healthimaging_import.arn}
    
    To use this POC:
    1. Attach the policy ARN to your AWS user: ${aws_iam_policy.healthimaging_policy.arn}
    2. Set environment variables in your .env file:
       - AWS_REGION=${var.aws_region}
       - HEALTHIMAGING_DATASTORE_ID=${awscc_healthimaging_datastore.dicom_datastore.datastore_id}
    3. Upload DICOM files to S3 bucket: ${aws_s3_bucket.dicom_files.bucket}
    4. Use AWS Console to start import job with role: ${aws_iam_role.healthimaging_import.arn}
    
    For local development:
    1. Use AWS SSO: aws configure sso && aws sso login
    2. Or use AWS CLI profiles: aws configure --profile your-profile
  EOF
}
