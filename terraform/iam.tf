# IAM Policy for HealthImaging with least privilege
resource "aws_iam_policy" "healthimaging_policy" {
  name        = "${var.project_name}-healthimaging-policy"
  description = "Least privilege policy for DICOM HealthImaging POC"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "medical-imaging:SearchImageSets",
          "medical-imaging:GetImageSetMetadata",
          "medical-imaging:GetImageFrame",
          "medical-imaging:ListDatastores",
          "medical-imaging:GetDatastore",
          "medical-imaging:ListImageSetVersions"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "aws:RequestedRegion" = var.aws_region
          }
        }
      }
    ]
  })

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# IAM User for the application
resource "aws_iam_user" "healthimaging_user" {
  name = "${var.project_name}-user"
  path = "/"

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Purpose     = "HealthImaging POC Application"
  }
}

# Attach policy to user
resource "aws_iam_user_policy_attachment" "healthimaging_user_policy" {
  user       = aws_iam_user.healthimaging_user.name
  policy_arn = aws_iam_policy.healthimaging_policy.arn
}

# Create access key for the user
resource "aws_iam_access_key" "healthimaging_user_key" {
  user = aws_iam_user.healthimaging_user.name
}
