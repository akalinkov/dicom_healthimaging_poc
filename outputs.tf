# Output the AWS credentials for manual addition to .env
output "aws_access_key_id" {
  description = "AWS Access Key ID for the HealthImaging user"
  value       = aws_iam_access_key.healthimaging_user_key.id
  sensitive   = true
}

output "aws_secret_access_key" {
  description = "AWS Secret Access Key for the HealthImaging user"
  value       = aws_iam_access_key.healthimaging_user_key.secret
  sensitive   = true
}

output "aws_region" {
  description = "AWS region where resources are created"
  value       = var.aws_region
}

output "iam_user_name" {
  description = "Name of the IAM user created"
  value       = aws_iam_user.healthimaging_user.name
}

output "iam_policy_arn" {
  description = "ARN of the IAM policy created"
  value       = aws_iam_policy.healthimaging_policy.arn
}

# Instructions for manual setup
output "setup_instructions" {
  description = "Instructions for setting up the .env file"
  value = <<-EOF
    Please add the following to your .env file:
    
    AWS_ACCESS_KEY_ID=${aws_iam_access_key.healthimaging_user_key.id}
    AWS_SECRET_ACCESS_KEY=${aws_iam_access_key.healthimaging_user_key.secret}
    AWS_REGION=${var.aws_region}
    
    Note: Keep these credentials secure and never commit them to version control.
  EOF
  sensitive = true
}
